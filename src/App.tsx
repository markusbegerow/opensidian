import { AppShell } from "./components/layout/AppShell";
import { WelcomeWizard } from "./components/onboarding/WelcomeWizard";
import { VaultSetupModal } from "./components/onboarding/VaultSetupModal";
import { useVaultStore } from "./store/vaultStore";
import { useOnboardingStore } from "./store/onboardingStore";
import "./store/themeStore"; // ensures theme class is applied before first render

export default function App() {
  const vaultPath = useVaultStore((s) => s.vaultPath);
  const isOpen = useOnboardingStore((s) => s.isOpen);

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
