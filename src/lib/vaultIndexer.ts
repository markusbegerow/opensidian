import type { VaultFile } from "../types/vault";
import { readFilesBatch } from "./tauriFs";
import { extractWikilinks } from "./wikilinkParser";
import { useWikilinkStore } from "../store/wikilinkStore";
import { useVaultStore } from "../store/vaultStore";
import { useNoteEmojiStore, extractNoteEmoji, extractHeadingPreview } from "../store/noteEmojiStore";
import { basename } from "./tauriFs";

const CHUNK_SIZE = 20;

/** Index all markdown files in the vault. */
export async function indexAll(files: VaultFile[]): Promise<void> {
  const mdFiles = files.filter((f) => !f.is_dir && f.extension === "md");
  useVaultStore.getState().setIndexing(true);
  useWikilinkStore.getState().reset();
  useNoteEmojiStore.getState().reset();

  // Process in chunks to avoid overwhelming IPC
  for (let i = 0; i < mdFiles.length; i += CHUNK_SIZE) {
    const chunk = mdFiles.slice(i, i + CHUNK_SIZE);
    const paths = chunk.map((f) => f.path);
    const results = await readFilesBatch(paths);

    for (const [path, content] of results) {
      if (content !== null) {
        useWikilinkStore.getState().setLinksForFile(path, extractWikilinks(content));
        useNoteEmojiStore.getState().setEmoji(path, extractNoteEmoji(content));
        useNoteEmojiStore.getState().setPreview(path, extractHeadingPreview(content));
      }
    }
  }

  useVaultStore.getState().setIndexing(false);
}

/** Re-index a single file with already-loaded content. */
export function indexFile(path: string, content: string): void {
  useWikilinkStore.getState().setLinksForFile(path, extractWikilinks(content));
  useNoteEmojiStore.getState().setEmoji(path, extractNoteEmoji(content));
  useNoteEmojiStore.getState().setPreview(path, extractHeadingPreview(content));
}

/** Get basename without .md for use as backlink key. */
export function fileBasename(path: string): string {
  return basename(path, ".md");
}
