import { create } from "zustand";

export type SettingsSection = "appearance" | "llm";

interface SettingsStore {
  isOpen: boolean;
  section: SettingsSection;
  open: (section?: SettingsSection) => void;
  close: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  isOpen: false,
  section: "appearance",
  open: (section = "appearance") => set({ isOpen: true, section }),
  close: () => set({ isOpen: false }),
}));
