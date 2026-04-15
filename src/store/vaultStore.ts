import { create } from "zustand";
import type { VaultFile, FsEvent } from "../types/vault";
import { openVault as tauriOpenVault, pickVaultFolder, readFile } from "../lib/tauriFs";
import { indexAll, indexFile } from "../lib/vaultIndexer";
import { useWikilinkStore } from "./wikilinkStore";
import { useColorStore } from "./colorStore";
import { vaultRef } from "../lib/vaultRef";
import { readConfigFile } from "../lib/configFile";
import { useThemeStore } from "./themeStore";
import { useLLMStore } from "./llmStore";
import { useOnboardingStore } from "./onboardingStore";

interface VaultState {
  vaultPath: string | null;
  files: VaultFile[];
  isIndexing: boolean;

  openVault: (path: string) => Promise<void>;
  pickAndOpenVault: () => Promise<void>;
  refreshFiles: () => Promise<void>;
  handleFsEvent: (event: FsEvent) => Promise<void>;
  setIndexing: (v: boolean) => void;
}

export const useVaultStore = create<VaultState>()((set, get) => ({
  vaultPath: null,
  files: [],
  isIndexing: false,

  setIndexing: (v) => set({ isIndexing: v }),

  openVault: async (path) => {
    vaultRef.path = path;
    const files = await tauriOpenVault(path);
    set({ vaultPath: path, files });
    await Promise.all([
      indexAll(files),
      useColorStore.getState().loadFromVault(path),
    ]);
    // Apply persisted settings from .configs/config.md
    const config = await readConfigFile(path);
    if (config.theme === "light" || config.theme === "dark") {
      useThemeStore.getState().setTheme(config.theme);
    }
    if (config.fontSize) {
      useThemeStore.getState().setFontSize(Number(config.fontSize));
    }
    const hasLlm = config["llm.url"] || config["llm.model"] || config["llm.token"];
    if (hasLlm) {
      useLLMStore.getState().updateSettings({
        url: config["llm.url"] ?? "",
        model: config["llm.model"] ?? "",
        token: config["llm.token"] ?? "",
      });
    }
    if (config.hasSeenOnboarding !== "true") {
      useOnboardingStore.getState().open();
    } else {
      useOnboardingStore.setState({ hasSeenOnboarding: true });
    }
  },

  pickAndOpenVault: async () => {
    const path = await pickVaultFolder();
    if (path) {
      await get().openVault(path);
    }
  },

  refreshFiles: async () => {
    const { vaultPath } = get();
    if (!vaultPath) return;
    const files = await tauriOpenVault(vaultPath);
    set({ files });
    await indexAll(files);
  },

  handleFsEvent: async (event) => {
    const { vaultPath } = get();
    if (!vaultPath) return;

    const kindStr = event.kind.toLowerCase();

    if (kindStr.includes("remove")) {
      for (const path of event.paths) {
        useWikilinkStore.getState().removeFile(path);
        set((state) => ({ files: state.files.filter((f) => f.path !== path) }));
      }
      return;
    }

    if (kindStr.includes("create") || kindStr.includes("modify")) {
      // Refresh the full file list for creates; re-index content for modifies
      const files = await tauriOpenVault(vaultPath);
      set({ files });
      // Reload color config if colors.md changed
      if (event.paths.some((p) => p.toLowerCase().endsWith("colors.md"))) {
        await useColorStore.getState().loadFromVault(vaultPath);
      }

      for (const path of event.paths) {
        if (path.endsWith(".md")) {
          try {
            const content = await readFile(path);
            indexFile(path, content);
          } catch {
            // File may have been deleted between event and read
          }
        }
      }
    }
  },
}));
