import { useState } from "react";
import { FolderOpen, FolderPlus, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { pickVaultFolder } from "../../lib/tauriFs";
import { scaffoldVault } from "../../lib/vaultScaffold";
import { useVaultStore } from "../../store/vaultStore";
import { useOnboardingStore } from "../../store/onboardingStore";

const SCAFFOLD_PREVIEW = [
  { path: ".configs/config.md", desc: "Theme, font size and app settings" },
  { path: ".configs/colors.md", desc: "Your emoji → color mapping table" },
  { path: ".templates/Colleague.md", desc: "Reusable colleague note template" },
  { path: ".templates/Project.md", desc: "Reusable project note template" },
  { path: ".templates/Meeting.md", desc: "Reusable meeting note template" },
];

type Status = "idle" | "loading" | "done" | "error";

export function VaultSetupModal() {
  const openVault = useVaultStore((s) => s.openVault);
  const { completeSetup, open: openWizard } = useOnboardingStore();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handlePick() {
    setError(null);
    const folder = await pickVaultFolder();
    if (!folder) return;
    await run(folder);
  }

  async function run(folder: string) {
    setStatus("loading");
    try {
      await scaffoldVault(folder);
      await openVault(folder);
      completeSetup();
      setStatus("done");
      // Show the concept wizard after a brief moment
      setTimeout(() => openWizard(), 400);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base">
      <div className="w-[480px] space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Set up your vault</h1>
          <p className="text-muted text-sm mt-1">
            Choose a folder for your notes. Opensidian will create a starter
            structure inside it.
          </p>
        </div>

        {/* What will be created */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            Files that will be created
          </p>
          {SCAFFOLD_PREVIEW.map((item) => (
            <div key={item.path} className="flex items-start gap-2.5">
              <ChevronRight size={13} className="text-accent mt-0.5 shrink-0" />
              <div className="min-w-0">
                <code className="text-xs text-accent font-mono">{item.path}</code>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {status === "idle" || status === "error" ? (
          <div className="space-y-3">
            <button
              onClick={handlePick}
              className="flex items-center justify-between w-full px-4 py-3.5 bg-accent text-white rounded-xl hover:bg-accent/80 transition-colors font-medium"
            >
              <div className="flex items-center gap-2.5">
                <FolderPlus size={18} />
                <div className="text-left">
                  <p className="text-sm font-semibold">Create new vault</p>
                  <p className="text-xs opacity-75">Pick an empty folder to set up</p>
                </div>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={handlePick}
              className="flex items-center justify-between w-full px-4 py-3.5 border border-border rounded-xl hover:border-accent/50 hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen size={18} className="text-accent" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-text">Use existing folder</p>
                  <p className="text-xs text-muted">Add starter files to an existing folder</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </button>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>
        ) : status === "loading" ? (
          <div className="flex items-center justify-center gap-3 py-6 text-muted">
            <Loader2 size={20} className="animate-spin text-accent" />
            <span className="text-sm">Setting up your vault…</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 py-6 text-green-400">
            <CheckCircle2 size={20} />
            <span className="text-sm font-medium">Vault ready!</span>
          </div>
        )}
      </div>
    </div>
  );
}
