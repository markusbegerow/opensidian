import { useState } from "react";
import { X, Loader2, Palette, Bot, RotateCcw } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { useSettingsStore, SettingsSection } from "../../store/settingsStore";
import { useLLMStore, LLMSettings } from "../../store/llmStore";
import { useOnboardingStore } from "../../store/onboardingStore";
import { callLLM } from "../../lib/llmService";

const NAV: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { id: "appearance", label: "Appearance", icon: <Palette size={15} /> },
  { id: "llm", label: "AI & LLM", icon: <Bot size={15} /> },
];

export function SettingsModal() {
  const { close, section, open } = useSettingsStore();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-[680px] max-h-[520px] flex overflow-hidden">
        {/* Left nav */}
        <nav className="w-44 shrink-0 border-r border-border bg-base py-4 px-2 flex flex-col gap-0.5">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider px-2 mb-2">
            Settings
          </p>
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => open(item.id)}
              className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                section === item.id
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-muted hover:text-text hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
            <span className="font-semibold text-sm">
              {NAV.find((n) => n.id === section)?.label}
            </span>
            <button
              onClick={close}
              className="text-muted hover:text-text transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Section body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {section === "appearance" && <AppearanceSection />}
            {section === "llm" && <LLMSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Appearance ─────────────────────────────────────────────────── */

function AppearanceSection() {
  const { theme, setTheme, fontSize, setFontSize } = useThemeStore();
  const { resetAll } = useOnboardingStore();
  const [resetDone, setResetDone] = useState(false);

  function handleReset() {
    resetAll();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <label className="block text-sm font-medium mb-3">Theme</label>
        <div className="flex gap-3">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors capitalize ${
                theme === t
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:border-accent/50 hover:text-text"
              }`}
            >
              {t === "dark" ? "🌙 Dark" : "☀️ Light"}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Font size</label>
          <span className="text-sm text-accent font-mono">{fontSize}px</span>
        </div>
        <input
          type="range"
          min={12}
          max={22}
          step={1}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>12px</span>
          <span>22px</span>
        </div>
      </div>

      {/* Reset onboarding */}
      <div className="border-t border-border pt-5">
        <label className="block text-sm font-medium mb-1">First-run setup</label>
        <p className="text-xs text-muted mb-3">
          Reset the vault setup and welcome wizard so they appear again on next launch.
        </p>
        <button
          onClick={handleReset}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
            resetDone
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-border text-muted hover:border-accent/50 hover:text-text"
          }`}
        >
          <RotateCcw size={14} />
          {resetDone ? "Reset done — restart the app" : "Reset setup & onboarding"}
        </button>
      </div>
    </div>
  );
}

/* ── AI & LLM ───────────────────────────────────────────────────── */

function LLMSection() {
  const { settings, updateSettings } = useLLMStore();
  const [form, setForm] = useState<LLMSettings>({ ...settings });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleChange(field: keyof LLMSettings, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setTestResult(null);
    setSaved(false);
  }

  function handleSave() {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted mb-1.5">API URL</label>
        <input
          className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
          placeholder="https://your-api/v1/chat/completions"
          value={form.url}
          onChange={(e) => handleChange("url", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs text-muted mb-1.5">Model</label>
        <input
          className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
          placeholder="gpt-4o"
          value={form.model}
          onChange={(e) => handleChange("model", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs text-muted mb-1.5">API Token</label>
        <input
          type="password"
          className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
          placeholder="sk-..."
          value={form.token}
          onChange={(e) => handleChange("token", e.target.value)}
        />
      </div>

      {testResult && (
        <p
          className={`text-xs px-3 py-2 rounded-lg ${
            testResult.startsWith("Error")
              ? "bg-red-500/10 text-red-400"
              : "bg-green-500/10 text-green-400"
          }`}
        >
          {testResult}
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleTest}
          disabled={testing || !form.url || !form.model}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-accent disabled:opacity-40 transition-colors"
        >
          {testing && <Loader2 size={13} className="animate-spin" />}
          Test connection
        </button>
        <button
          onClick={handleSave}
          className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
            saved
              ? "bg-green-500/20 text-green-400"
              : "bg-accent text-white hover:bg-accent/80"
          }`}
        >
          {saved ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
}
