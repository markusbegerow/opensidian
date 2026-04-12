import { useState } from "react";
import { ArrowRight, ArrowLeft, X, Link2, Palette, Rocket, FileText, Bot } from "lucide-react";
import { useOnboardingStore } from "../../store/onboardingStore";
import { useLLMStore } from "../../store/llmStore";

const STEPS = [
  {
    icon: <Rocket size={28} className="text-accent" />,
    title: "Welcome to Opensidian",
    content: <StepWelcome />,
  },
  {
    icon: <Link2 size={28} className="text-accent" />,
    title: "Connect with Wikilinks",
    content: <StepWikilinks />,
  },
  {
    icon: <FileText size={28} className="text-accent" />,
    title: "Note Templates",
    content: <StepTemplates />,
  },
  {
    icon: <Palette size={28} className="text-accent" />,
    title: "Color & Emoji system",
    content: <StepColors />,
  },
  {
    icon: <Bot size={28} className="text-accent" />,
    title: "AI & LLM Setup",
    content: <StepLLM />,
  },
];

export function WelcomeWizard() {
  const [step, setStep] = useState(0);
  const complete = useOnboardingStore((s) => s.complete);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-[680px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            {current.icon}
            <h2 className="text-lg font-bold">{current.title}</h2>
          </div>
          <button
            onClick={complete}
            className="text-muted hover:text-text transition-colors"
            title="Skip"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 min-h-[300px]">{current.content}</div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? "bg-accent" : "bg-border hover:bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted hover:text-text border border-border rounded-lg hover:bg-white/5 transition-colors"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            )}
            <button
              onClick={() => (isLast ? complete() : setStep((s) => s + 1))}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
            >
              {isLast ? "Get started" : "Next"}
              {!isLast && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 1: Welcome ─────────────────────────────────────────────── */

function StepWelcome() {
  return (
    <div className="space-y-4">
      <p className="text-text leading-relaxed">
        Opensidian is a <span className="text-accent font-medium">local-first</span> note-taking
        app built around plain Markdown files. Your notes live in a folder you
        choose — no accounts, no cloud, no lock-in.
      </p>

      <div className="grid grid-cols-3 gap-3 pt-1">
        {[
          { emoji: "📁", label: "Your folder", desc: "Notes stay on your machine" },
          { emoji: "✍️", label: "Plain Markdown", desc: "Open in any editor" },
          { emoji: "🔓", label: "Open source", desc: "Free forever" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-base border border-border"
          >
            <span className="text-2xl">{item.emoji}</span>
            <p className="text-xs font-semibold text-text">{item.label}</p>
            <p className="text-xs text-muted">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 2: Wikilinks ───────────────────────────────────────────── */

function StepWikilinks() {
  return (
    <div className="space-y-4">
      <p className="text-text leading-relaxed">
        Type{" "}
        <code className="bg-base border border-border rounded px-1.5 py-0.5 text-accent font-mono text-sm">
          [[Note Name]]
        </code>{" "}
        anywhere in a note to create a link. Opensidian tracks every connection automatically.
      </p>

      <div className="bg-base border border-border rounded-xl p-4 font-mono text-sm space-y-1 text-muted">
        <p><span className="text-accent font-bold"># </span><span className="text-text">🟨 Project Alpha</span></p>
        <p className="pt-1">Owner: <span className="text-accent underline">[[Anna Example]]</span></p>
        <p>Kickoff: <span className="text-accent underline">[[2026-04-15 Kickoff]]</span></p>
        <p>Depends on: <span className="text-accent underline">[[Project Beta]]</span></p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { emoji: "🔗", label: "Backlinks panel", desc: "See every note that links to the current one" },
          { emoji: "🕸️", label: "Graph view", desc: "Ctrl+G — visualize your entire knowledge network" },
        ].map((item) => (
          <div key={item.label} className="flex gap-2.5 p-3 rounded-xl bg-base border border-border">
            <span className="text-xl shrink-0">{item.emoji}</span>
            <div>
              <p className="text-xs font-semibold text-text">{item.label}</p>
              <p className="text-xs text-muted mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 3: Colors how-to ───────────────────────────────────────── */

function StepColors() {
  return (
    <div className="space-y-3">
      <p className="text-text text-sm leading-relaxed">
        Prefix note titles with a colored emoji to visually type them at a glance.
        Create{" "}
        <code className="bg-base border border-border rounded px-1 text-accent font-mono text-xs">
          .configs/colors.md
        </code>{" "}
        in your vault to define your own system:
      </p>

      {/* Format example */}
      <div className="bg-base border border-border rounded-xl p-4 font-mono text-xs space-y-1">
        <p className="text-muted"># Color System</p>
        <p className="pt-1 text-muted">
          | Emoji | Color &nbsp;&nbsp;&nbsp; | Type &nbsp;&nbsp;&nbsp;&nbsp; | Description &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
        </p>
        <p className="text-muted">|-------|---------|-----------|------------------|</p>
        {[
          { emoji: "🟩", color: "#a6e3a1", type: "Colleague", desc: "Team members" },
          { emoji: "🟨", color: "#f9e2af", type: "Project  ", desc: "Initiatives" },
          { emoji: "🟫", color: "#f44336", type: "Meeting  ", desc: "Events & calls" },
          { emoji: "🟧", color: "#fab387", type: "Review   ", desc: "Audits & checks" },
          { emoji: "🟦", color: "#74c7ec", type: "Team     ", desc: "Groups & squads" },
        ].map((row) => (
          <p key={row.type}>
            <span>{row.emoji}</span>
            <span className="text-muted"> | </span>
            <span className="text-accent">{row.color}</span>
            <span className="text-muted"> | {row.type} | {row.desc}</span>
          </p>
        ))}
      </div>

      <p className="text-xs text-muted">
        The graph view reads these mappings and colors each node accordingly.
        Use any emoji and any hex color — it's fully yours to define.
      </p>
    </div>
  );
}

/* ── Step 4: Templates how-to ────────────────────────────────────── */

const TEMPLATES = {
  Colleague: {
    emoji: "🟩",
    file: ".templates/Colleague.md",
    lines: [
      "# 🟩 <Full Name>",
      "",
      "**Role:** ",
      "**Department:** ",
      "**Manager:** [[]]",
      "",
      "## Goals",
      "- ",
      "",
      "## Notes",
      "- ",
    ],
  },
  Project: {
    emoji: "🟨",
    file: ".templates/Project.md",
    lines: [
      "# 🟨 <Project Name>",
      "",
      "**Goal:** ",
      "**Owner:** [[]]",
      "**Sponsor:** [[]]",
      "",
      "## Status",
      "- [ ] ",
      "",
      "## Risks",
      "- ",
    ],
  },
  Meeting: {
    emoji: "🟫",
    file: ".templates/Meeting.md",
    lines: [
      "# 🟫 <Date> <Title>",
      "",
      "**Date:** ",
      "**Participants:** [[]], [[]]",
      "",
      "## Agenda",
      "- ",
      "",
      "## Decisions / Actions",
      "- [ ] ",
    ],
  },
};

type TemplateKey = keyof typeof TEMPLATES;

function StepTemplates() {
  const [active, setActive] = useState<TemplateKey>("Colleague");
  const tpl = TEMPLATES[active];

  return (
    <div className="space-y-3">
      <p className="text-text text-sm leading-relaxed">
        Your vault was set up with a{" "}
        <code className="bg-base border border-border rounded px-1 text-accent font-mono text-xs">
          .templates/
        </code>{" "}
        folder and a{" "}
        <code className="bg-base border border-border rounded px-1 text-accent font-mono text-xs">
          .configs/config.md
        </code>{" "}
        for app settings. Browse the three starter templates below:
      </p>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-base border border-border rounded-lg p-1">
        {(Object.keys(TEMPLATES) as TemplateKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors ${
              active === key
                ? "bg-surface border border-border text-text shadow-sm"
                : "text-muted hover:text-text"
            }`}
          >
            <span>{TEMPLATES[key].emoji}</span>
            {key}
          </button>
        ))}
      </div>

      {/* Template preview */}
      <div className="bg-base border border-border rounded-xl px-4 py-3 font-mono text-xs space-y-0.5 max-h-[148px] overflow-y-auto">
        <p className="text-muted mb-1">{tpl.file}</p>
        {tpl.lines.map((line, i) =>
          line === "" ? (
            <p key={i} className="h-3" />
          ) : line.startsWith("#") ? (
            <p key={i} className="text-accent font-bold">{line}</p>
          ) : line.startsWith("**") ? (
            <p key={i}>
              <span className="text-text font-semibold">{line.split(":**")[0] + ":"}</span>
              <span className="text-muted">{line.split(":**")[1]}</span>
            </p>
          ) : line.startsWith("##") ? (
            <p key={i} className="text-accent pt-1">{line}</p>
          ) : (
            <p key={i} className="text-muted">{line}</p>
          )
        )}
      </div>

      <p className="text-xs text-muted">
        When creating a new note, copy any template as a starting point.
        Link colleagues, projects, and meetings together with{" "}
        <code className="bg-base border border-border rounded px-1 text-accent font-mono">[[wikilinks]]</code>.
      </p>
    </div>
  );
}

/* ── Step 5: LLM Setup ───────────────────────────────────────────── */

function StepLLM() {
  const { settings, updateSettings } = useLLMStore();
  const [form, setForm] = useState({
    url: settings.url || "https://api.openai.com/v1/chat/completions",
    model: settings.model || "gpt-4o",
    token: settings.token || "",
  });

  function handleChange(field: keyof typeof form, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    updateSettings(updated);
  }

  return (
    <div className="space-y-4">
      <p className="text-text text-sm leading-relaxed">
        Connect an OpenAI-compatible API to chat with your notes using AI.
        You can skip this and configure it later in{" "}
        <span className="text-accent font-medium">Settings → AI & LLM</span>.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-muted mb-1.5">API URL</label>
          <input
            className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
            value={form.url}
            onChange={(e) => handleChange("url", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Model</label>
          <input
            className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
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
      </div>

      <p className="text-xs text-muted pt-1">Works with any OpenAI-compatible endpoint.</p>
    </div>
  );
}
