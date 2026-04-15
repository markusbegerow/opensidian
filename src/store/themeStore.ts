import { create } from "zustand";
import { vaultRef } from "../lib/vaultRef";
import { updateConfigKeys } from "../lib/configFile";

type Theme = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  fontSize: number;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setFontSize: (size: number) => void;
}

function applyTheme(theme: Theme) {
  if (theme === "light") {
    document.documentElement.classList.add("light");
  } else {
    document.documentElement.classList.remove("light");
  }
}

function applyFontSize(size: number) {
  document.documentElement.style.setProperty("--font-size", `${size}px`);
}

applyTheme("light");
applyFontSize(16);

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "light",
  fontSize: 16,

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
    if (vaultRef.path) updateConfigKeys(vaultRef.path, { theme });
  },

  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      if (vaultRef.path) updateConfigKeys(vaultRef.path, { theme: next });
      return { theme: next };
    }),

  setFontSize: (size) => {
    applyFontSize(size);
    set({ fontSize: size });
    if (vaultRef.path) updateConfigKeys(vaultRef.path, { fontSize: String(size) });
  },
}));
