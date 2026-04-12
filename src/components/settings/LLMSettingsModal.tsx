import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useLLMStore, LLMSettings } from "../../store/llmStore";
import { callLLM } from "../../lib/llmService";

interface Props {
  onClose: () => void;
}

export function LLMSettingsModal({ onClose }: Props) {
  const { settings, updateSettings } = useLLMStore();
  const [form, setForm] = useState<LLMSettings>({ ...settings });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  function handleChange(field: keyof LLMSettings, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setTestResult(null);
  }

  function handleSave() {
    updateSettings(form);
    onClose();
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const reply = await callLLM(form, [
        { role: "user", content: "Reply with exactly: OK" },
      ]);
      setTestResult(`Connected! Response: ${reply.slice(0, 80)}`);
    } catch (e: unknown) {
      setTestResult(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface border border-border rounded-lg w-[480px] shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-medium text-sm">LLM Settings</span>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">API URL</label>
            <input
              className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
              placeholder="https://your-api/v1/chat/completions"
              value={form.url}
              onChange={(e) => handleChange("url", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Model</label>
            <input
              className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
              placeholder="basismodell"
              value={form.model}
              onChange={(e) => handleChange("model", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">API Token</label>
            <input
              type="password"
              className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
              placeholder="sk-..."
              value={form.token}
              onChange={(e) => handleChange("token", e.target.value)}
            />
          </div>

          {testResult && (
            <p
              className={`text-xs px-3 py-2 rounded ${
                testResult.startsWith("Error")
                  ? "bg-red-500/10 text-red-400"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              {testResult}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <button
            onClick={handleTest}
            disabled={testing || !form.url || !form.model}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-accent disabled:opacity-40"
          >
            {testing && <Loader2 size={12} className="animate-spin" />}
            Test connection
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded border border-border hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs rounded bg-accent text-white hover:bg-accent/80"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
