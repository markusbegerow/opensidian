import { readFile, readFilesBatch, basename } from "./tauriFs";
import { useEditorStore } from "../store/editorStore";
import { useWikilinkStore } from "../store/wikilinkStore";
import { useVaultStore } from "../store/vaultStore";
import { useLLMStore } from "../store/llmStore";

const MAX_FILE_CHARS = 2000;
const MAX_VAULT_CHARS = 80000;

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
  parts.push(
    "Answer questions based on the provided notes. " +
    "Always cite the exact note name(s) using [Source: NoteName] format when using information from them."
  );

  const allNotes = files.filter(
    (f) =>
      !f.is_dir &&
      f.path.endsWith(".md") &&
      !f.path.split("/").some((seg) => seg.startsWith("."))
  );

  const coveredPaths = new Set<string>();

  if (!activeFilePath) {
    parts.push("\nNo note is currently open.");
  } else {
    const activeName = basename(activeFilePath, ".md");
    coveredPaths.add(activeFilePath);

    parts.push(`\n## Current note: "${activeName}"`);
    parts.push(truncate(content, MAX_FILE_CHARS));

    const outboundTargets = linkMap[activeFilePath] ?? [];
    const inboundSources = backlinkMap[activeName] ?? [];

    if (outboundTargets.length > 0) {
      parts.push(`\n## Links from "${activeName}" to:`);
      parts.push(outboundTargets.map((t) => `- [[${t}]]`).join("\n"));
    }
    if (inboundSources.length > 0) {
      parts.push(`\n## Notes linking to "${activeName}":`);
      parts.push(inboundSources.map((p) => `- [[${basename(p, ".md")}]]`).join("\n"));
    }

    // Outbound-linked files (highest relevance)
    let usedChars = parts.join("\n").length;
    if (outboundTargets.length > 0) {
      parts.push("\n## Linked notes content:");
      for (const target of outboundTargets) {
        if (usedChars >= MAX_VAULT_CHARS) break;
        const linkedFile = allNotes.find((f) => basename(f.path, ".md") === target);
        if (!linkedFile) continue;
        try {
          const fileContent = await readFile(linkedFile.path);
          const block = `\n### [Source: ${target}]\n${truncate(fileContent, MAX_FILE_CHARS)}`;
          usedChars += block.length;
          parts.push(block);
          coveredPaths.add(linkedFile.path);
        } catch {
          // skip unreadable files
        }
      }
    }

    // Inbound-linked files (second priority)
    for (const srcPath of inboundSources) {
      if (usedChars >= MAX_VAULT_CHARS) break;
      if (coveredPaths.has(srcPath)) continue;
      try {
        const fileContent = await readFile(srcPath);
        const name = basename(srcPath, ".md");
        const block = `\n### [Source: ${name}]\n${truncate(fileContent, MAX_FILE_CHARS)}`;
        usedChars += block.length;
        parts.push(block);
        coveredPaths.add(srcPath);
      } catch {
        // skip unreadable files
      }
    }
  }

  // Batch-read all remaining vault files alphabetically
  const remaining = allNotes
    .filter((f) => !coveredPaths.has(f.path))
    .sort((a, b) => a.path.localeCompare(b.path));

  if (remaining.length > 0) {
    const batchResults = await readFilesBatch(remaining.map((f) => f.path));
    let usedCharsTotal = parts.join("\n").length;
    parts.push("\n## All vault notes:");
    for (const [filePath, fileContent] of batchResults) {
      if (usedCharsTotal >= MAX_VAULT_CHARS) break;
      if (!fileContent) continue;
      const name = basename(filePath, ".md");
      const block = `\n### [Source: ${name}]\n${truncate(fileContent, MAX_FILE_CHARS)}`;
      usedCharsTotal += block.length;
      parts.push(block);
    }
  }

  const { settings } = useLLMStore.getState();
  if (settings.systemPrompt?.trim()) {
    parts.push("\n## Additional instructions:");
    parts.push(settings.systemPrompt.trim());
  }

  return parts.join("\n");
}
