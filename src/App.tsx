import { useEffect } from "react";
import { AppShell } from "./components/layout/AppShell";
import { WelcomeWizard } from "./components/onboarding/WelcomeWizard";
import { VaultSetupModal } from "./components/onboarding/VaultSetupModal";
import { useVaultStore } from "./store/vaultStore";
import { useOnboardingStore } from "./store/onboardingStore";
import "./store/themeStore"; // ensures theme class is applied before first render

export default function App() {
  const vaultPath = useVaultStore((s) => s.vaultPath);
  const { hasCompletedSetup, hasSeenOnboarding, isOpen, open } = useOnboardingStore();

  // Auto-show concept wizard after setup is done (for returning users who haven't seen it)
  useEffect(() => {
    if (hasCompletedSetup && !hasSeenOnboarding) open();
  }, [hasCompletedSetup]);

  // First launch: show vault setup
  if (!hasCompletedSetup) {
    return (
      <>
        <VaultSetupModal />
        {isOpen && <WelcomeWizard />}
      </>
    );
  }

  // Vault not open yet (returning user, no vault selected this session)
  if (!vaultPath) {
    return (
      <>
        <VaultSetupModal />
        {isOpen && <WelcomeWizard />}
      </>
    );
  }

  return (
    <>
      <AppShell />
      {isOpen && <WelcomeWizard />}
    </>
  );
}
