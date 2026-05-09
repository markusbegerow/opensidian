import type { VaultFile } from "../types/vault";
import { basename } from "./tauriFs";

// Matches [[Target]], [[Target#section]], [[Target|alias]], [[Target#section|alias]]
const WIKILINK_REGEX = /\[\[([^\[\]|#]+?)(?:#[^\[\]|]*)?(?:\|[^\[\]]*?)?\]\]/g;

/**
 * Extract all wikilink targets from markdown content.
 * Returns basenames without .md extension.
 */
export function extractWikilinks(content: string): string[] {
  const targets: string[] = [];
  let match: RegExpExecArray | null;

  WIKILINK_REGEX.lastIndex = 0;
  while ((match = WIKILINK_REGEX.exec(content)) !== null) {
    const target = match[1].trim();
    if (target) targets.push(target);
  }

  return [...new Set(targets)]; // deduplicate
}

/**
 * Resolve a wikilink target to a file path.
 * Shortest path wins (fewest parent directories) — matches Opensidian behavior.
 */
export function resolveWikilink(
  target: string,
  files: VaultFile[]
): VaultFile | null {
  const targetLower = target.toLowerCase();

  const candidates = files.filter((f) => {
    if (f.is_dir) return false;
    const name = basename(f.name, ".md").toLowerCase();
    return name === targetLower;
  });

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Shortest path = fewest slashes
  return candidates.reduce((best, current) => {
    const bestDepth = best.path.split("/").length;
    const currDepth = current.path.split("/").length;
    return currDepth < bestDepth ? current : best;
  });
}

/**
 * Extract a short excerpt from content showing the first occurrence of a wikilink target.
 */
export function extractExcerpt(content: string, target: string): string {
  const lines = content.split("\n");
  const targetLower = target.toLowerCase();

  for (const line of lines) {
    if (line.toLowerCase().includes(targetLower)) {
      return line.trim().slice(0, 120);
    }
  }

  return lines[0]?.trim().slice(0, 120) ?? "";
}
