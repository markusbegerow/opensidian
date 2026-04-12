import { create } from "zustand";

interface OnboardingStore {
  hasCompletedSetup: boolean;
  hasSeenOnboarding: boolean;
  isOpen: boolean;
  open: () => void;
  complete: () => void;
  completeSetup: () => void;
  resetAll: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  hasCompletedSetup: localStorage.getItem("hasCompletedSetup") === "true",
  hasSeenOnboarding: localStorage.getItem("hasSeenOnboarding") === "true",
  isOpen: false,

  open: () => set({ isOpen: true }),

  complete: () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    set({ hasSeenOnboarding: true, isOpen: false });
  },

  completeSetup: () => {
    localStorage.setItem("hasCompletedSetup", "true");
    set({ hasCompletedSetup: true });
  },

  resetAll: () => {
    localStorage.removeItem("hasCompletedSetup");
    localStorage.removeItem("hasSeenOnboarding");
    set({ hasCompletedSetup: false, hasSeenOnboarding: false, isOpen: false });
  },
}));
