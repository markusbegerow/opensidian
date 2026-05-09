import { useMemo } from "react";
import { useWikilinkStore } from "../store/wikilinkStore";
import { useVaultStore } from "../store/vaultStore";
import { basename } from "../lib/tauriFs";
import { extractExcerpt } from "../lib/wikilinkParser";
import type { BacklinkEntry } from "../types/wikilink";

// Cache of content excerpts (populated lazily from editor content cache)
const contentCache = new Map<string, string>();

export function cacheContent(path: string, content: string) {
  contentCache.set(path, content);
}

export function useBacklinks(filePath: string | null): BacklinkEntry[] {
  const backlinkMap = useWikilinkStore((s) => s.backlinkMap);
  const files = useVaultStore((s) => s.files);

  return useMemo(() => {
    if (!filePath) return [];

    const fileBasename = basename(filePath, ".md");
    const sourcePaths = backlinkMap[fileBasename] ?? [];

    return sourcePaths.map((sourcePath) => {
      const file = files.find((f) => f.path === sourcePath);
      const sourceName = file ? basename(file.name, ".md") : basename(sourcePath, ".md");
      const cached = contentCache.get(sourcePath) ?? "";
      const excerpt = cached
        ? extractExcerpt(cached, fileBasename)
        : `Links to [[${fileBasename}]]`;

      return { sourcePath, sourceName, excerpt };
    });
  }, [filePath, backlinkMap, files]);
}
