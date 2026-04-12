import { create } from "zustand";
import { readFile } from "../lib/tauriFs";

export interface EmojiColor {
  color: string;
  label: string;
}

interface ColorState {
  emojiMap: Record<string, EmojiColor>;
  loadFromVault: (vaultPath: string) => Promise<void>;
}

/**
 * Built-in colors for colored square/circle emojis.
 * These are always available — no config file needed.
 */
export const BUILTIN_EMOJI_COLORS: Record<string, string> = {
  "🟥": "#e53935",
  "🟧": "#ef6c00",
  "🟨": "#f9a825",
  "🟩": "#43a047",
  "🟦": "#1e88e5",
  "🟪": "#8e24aa",
  "🟫": "#6d4c41",
  "⬛": "#616161",
  "⬜": "#bdbdbd",
  "🔴": "#e53935",
  "🟠": "#ef6c00",
  "🟡": "#f9a825",
  "🟢": "#43a047",
  "🔵": "#1e88e5",
  "🟣": "#8e24aa",
  "⚫": "#616161",
  "⚪": "#bdbdbd",
};

/** Candidate locations for colors.md relative to vault root */
const COLORS_PATHS = [
  ".configs/colors.md",
  ".config/colors.md",
  "colors.md",
];

function parseColorsFile(
  content: string
): Record<string, { color?: string; label: string }> {
  const result: Record<string, { color?: string; label: string }> = {};
  for (const line of content.split("\n")) {
    if (!line.includes("|")) continue;
    const parts = line.split("|").map((p) => p.trim()).filter(Boolean);
    if (parts.length < 3) continue;
    const emoji = parts[0];
    if (!emoji || emoji.startsWith("-") || emoji.toLowerCase() === "emoji") continue;
    const colorMatch = parts[1].match(/#([0-9a-fA-F]{3,6})/);
    const label = parts[2];
    result[emoji] = {
      color: colorMatch ? `#${colorMatch[1]}` : undefined,
      label,
    };
  }
  return result;
}

function buildEmojiMap(
  parsed: Record<string, { color?: string; label: string }>
): Record<string, EmojiColor> {
  const map: Record<string, EmojiColor> = {};

  // Start with built-in colors (no label)
  for (const [emoji, color] of Object.entries(BUILTIN_EMOJI_COLORS)) {
    map[emoji] = { color, label: "" };
  }

  // Overlay with colors.md: label always wins, color wins only if explicitly set
  for (const [emoji, entry] of Object.entries(parsed)) {
    const builtinColor = BUILTIN_EMOJI_COLORS[emoji];
    map[emoji] = {
      color: entry.color ?? builtinColor ?? "#cba6f7",
      label: entry.label,
    };
  }

  return map;
}

// Initialize with built-in colors so graph works even before vault loads
const INITIAL_MAP: Record<string, EmojiColor> = Object.fromEntries(
  Object.entries(BUILTIN_EMOJI_COLORS).map(([emoji, color]) => [
    emoji,
    { color, label: "" },
  ])
);

export const useColorStore = create<ColorState>()((set) => ({
  emojiMap: INITIAL_MAP,

  loadFromVault: async (vaultPath) => {
    for (const candidate of COLORS_PATHS) {
      try {
        const content = await readFile(`${vaultPath}/${candidate}`);
        const parsed = parseColorsFile(content);
        set({ emojiMap: buildEmojiMap(parsed) });
        return;
      } catch {
        // try next candidate
      }
    }
    // No colors.md found — keep built-in map (already set as initial)
  },
}));
