import { useMemo } from "react";
import { useWikilinkStore } from "../store/wikilinkStore";
import { useVaultStore } from "../store/vaultStore";
import { useColorStore } from "../store/colorStore";
import { useNoteEmojiStore } from "../store/noteEmojiStore";
import { basename, dirname } from "../lib/tauriFs";
import { resolveWikilink } from "../lib/wikilinkParser";
import type { GraphNode, GraphEdge } from "../types/graph";

export function useGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const linkMap = useWikilinkStore((s) => s.linkMap);
  const files = useVaultStore((s) => s.files);
  const emojiMap = useColorStore((s) => s.emojiMap);
  const emojiByPath = useNoteEmojiStore((s) => s.emojiByPath);
  const previewByPath = useNoteEmojiStore((s) => s.previewByPath);

  return useMemo(() => {
    const mdFiles = files.filter(
      (f) =>
        !f.is_dir &&
        f.extension === "md" &&
        !f.path.split("/").some((segment) => segment.startsWith("."))
    );

    // Count inbound links per file for node sizing
    const inboundCount: Record<string, number> = {};
    for (const targets of Object.values(linkMap)) {
      for (const target of targets) {
        const resolved = resolveWikilink(target, mdFiles);
        if (resolved) {
          inboundCount[resolved.path] = (inboundCount[resolved.path] ?? 0) + 1;
        }
      }
    }

    const nodes: GraphNode[] = mdFiles.map((f) => {
      const label = basename(f.name, ".md");
      const emoji = emojiByPath[f.path];
      const color = emoji ? (emojiMap[emoji]?.color ?? undefined) : undefined;
      const preview = previewByPath[f.path] ?? [];
      return {
        id: f.path,
        label,
        group: dirname(f.path),
        linkCount: inboundCount[f.path] ?? 0,
        color,
        preview,
      };
    });

    // Build a set of valid node IDs so edges never reference excluded nodes
    // (e.g. files inside hidden directories like .templates)
    const nodeIds = new Set(nodes.map((n) => n.id));

    const edges: GraphEdge[] = [];
    for (const [sourcePath, targets] of Object.entries(linkMap)) {
      if (!nodeIds.has(sourcePath)) continue; // source is in a hidden/excluded dir
      for (const target of targets) {
        const resolved = resolveWikilink(target, mdFiles);
        if (resolved && nodeIds.has(resolved.path)) {
          edges.push({ source: sourcePath, target: resolved.path });
        }
      }
    }

    return { nodes, edges };
  }, [linkMap, files, emojiMap, emojiByPath, previewByPath]);
}
