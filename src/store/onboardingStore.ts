import { create } from "zustand";
import { vaultRef } from "../lib/vaultRef";
import { updateConfigKeys } from "../lib/configFile";

interface OnboardingStore {
  hasSeenOnboarding: boolean;
  isOpen: boolean;
  open: () => void;
  complete: () => void;
  resetAll: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  hasSeenOnboarding: false,
  isOpen: false,

  open: () => set({ isOpen: true }),

  complete: () => {
    if (vaultRef.path) updateConfigKeys(vaultRef.path, { hasSeenOnboarding: "true" });
    set({ hasSeenOnboarding: true, isOpen: false });
  },

  resetAll: () => {
    if (vaultRef.path) updateConfigKeys(vaultRef.path, { hasSeenOnboarding: "false" });
    set({ hasSeenOnboarding: false, isOpen: false });
  },
}));
