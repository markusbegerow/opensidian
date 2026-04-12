import { readFile, basename } from "./tauriFs";
import { useEditorStore } from "../store/editorStore";
import { useWikilinkStore } from "../store/wikilinkStore";
import { useVaultStore } from "../store/vaultStore";

const MAX_FILE_CHARS = 3000;
const MAX_TOTAL_CHARS = 12000;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "\n...[truncated]";
}

export async function buildSystemPrompt(): Promise<string> {
  const { activeFilePath, content } = useEditorStore.getState();
  const { linkMap, backlinkMap } = useWikilinkStore.getState();
  const { files } = useVaultStore.getState();

  const parts: string[] = [];
  parts.push("You are an assistant for a personal knowledge base (Opensidian vault).");
  parts.push("Answer questions based on the provided notes. Be concise and cite note names when relevant.");

  if (!activeFilePath) {
    parts.push("\nNo note is currently open.");
    return parts.join("\n");
  }

  const activeName = basename(activeFilePath, ".md");

  // Active file
  parts.push(`\n## Current note: "${activeName}"`);
  parts.push(truncate(content, MAX_FILE_CHARS));

  // Outbound links
  const outboundTargets = linkMap[activeFilePath] ?? [];
  // Inbound links (backlinkMap key is basename)
  const inboundSources = backlinkMap[activeName] ?? [];

  // Relation summary
  if (outboundTargets.length > 0) {
    parts.push(`\n## Links from "${activeName}" to:`);
    parts.push(outboundTargets.map((t) => `- [[${t}]]`).join("\n"));
  }
  if (inboundSources.length > 0) {
    parts.push(`\n## Notes linking to "${activeName}":`);
    parts.push(
      inboundSources.map((p) => `- [[${basename(p, ".md")}]]`).join("\n")
    );
  }

  // Load content of linked files (outbound, up to char budget)
  let usedChars = parts.join("\n").length;
  if (outboundTargets.length > 0) {
    parts.push("\n## Linked notes content:");

    for (const target of outboundTargets) {
      if (usedChars >= MAX_TOTAL_CHARS) break;

      // Find the file path for this target basename
      const linkedFile = files.find(
        (f) => !f.is_dir && basename(f.path, ".md") === target
      );
      if (!linkedFile) continue;

      try {
        const fileContent = await readFile(linkedFile.path);
        const snippet = truncate(fileContent, MAX_FILE_CHARS);
        const block = `\n### [[${target}]]\n${snippet}`;
        usedChars += block.length;
        parts.push(block);
      } catch {
        // skip unreadable files
      }
    }
  }

  // All note names for awareness
  const allNotes = files.filter((f) => !f.is_dir && f.path.endsWith(".md"));
  if (allNotes.length > 0) {
    parts.push(
      `\n## All notes in vault (${allNotes.length} total):\n` +
        allNotes.map((f) => basename(f.path, ".md")).join(", ")
    );
  }

  return parts.join("\n");
}
