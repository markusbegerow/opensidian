import { readFile, writeFile } from "./tauriFs";

/** Parse a markdown table into a key→value map. */
export function parseConfig(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const match = line.match(/^\|\s*([^|]+?)\s*\|\s*(.*?)\s*\|/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim();
    if (!key || key === "Setting" || /^-+$/.test(key)) continue;
    result[key] = value;
  }
  return result;
}

const KEY_ORDER = [
  "getStarted",
  "hasSeenOnboarding",
  "theme",
  "fontSize",
  "llm.url",
  "llm.model",
  "llm.token",
];

/** Serialise a settings map back to the config.md table format. */
export function buildConfig(settings: Record<string, string>): string {
  // Stable key order: known keys first, then any extras alphabetically
  const knownKeys = KEY_ORDER.filter((k) => k in settings);
  const extraKeys = Object.keys(settings)
    .filter((k) => !KEY_ORDER.includes(k))
    .sort();
  const allKeys = [...knownKeys, ...extraKeys];

  const colWidth = Math.max(10, ...allKeys.map((k) => k.length));
  const rows = allKeys
    .map((k) => `| ${k.padEnd(colWidth)} | ${settings[k]} |`)
    .join("\n");
  const sep = `| ${"-".repeat(colWidth)} | ----- |`;
  const header = `| ${"Setting".padEnd(colWidth)} | Value |`;

  return `# Opensidian Config\n\n${header}\n${sep}\n${rows}\n`;
}

export async function readConfigFile(
  vaultPath: string
): Promise<Record<string, string>> {
  try {
    const content = await readFile(`${vaultPath}/.configs/config.md`);
    return parseConfig(content);
  } catch {
    return {};
  }
}

/** Read → merge updates → write back. Safe to call concurrently (last write wins). */
export async function updateConfigKeys(
  vaultPath: string,
  updates: Record<string, string>
): Promise<void> {
  try {
    const current = await readConfigFile(vaultPath);
    const merged = { ...current, ...updates };
    await writeFile(`${vaultPath}/.configs/config.md`, buildConfig(merged));
  } catch {
    // Non-fatal: vault may not be scaffolded yet
  }
}
