import { X, Globe, Github, Coffee, Code2, BookOpen } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useOnboardingStore } from "../../store/onboardingStore";

interface Props {
  onClose: () => void;
}

const LINKS = {
  website: "https://markus-begerow.de/linktree",
  github: "https://github.com/markusbegerow/opensidian",
  coffee: "https://paypal.me/MarkusBegerow",
};

function ExternalLink({
  href,
  icon,
  label,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      onClick={() => openUrl(href)}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors text-left group"
    >
      <span className="text-muted group-hover:text-accent transition-colors shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-text leading-none mb-0.5">{label}</p>
        <p className="text-xs text-muted truncate">{sub}</p>
      </div>
    </button>
  );
}

export function AboutModal({ onClose }: Props) {
  const openOnboarding = useOnboardingStore((s) => s.open);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-[380px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <span className="font-semibold text-sm">About</span>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* App identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0">
              <Code2 size={22} className="text-accent" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Opensidian</h2>
              <p className="text-xs text-muted mt-0.5">
                Open-source Markdown note-taking
              </p>
            </div>
            <span className="ml-auto text-xs text-muted border border-border rounded-full px-2 py-0.5 shrink-0">
              v0.1.0
            </span>
          </div>

          {/* Developer */}
          <div className="text-sm text-muted border-t border-border pt-4">
            Built by{" "}
            <span className="text-text font-medium">Markus Begerow</span>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <ExternalLink
              href={LINKS.website}
              icon={<Globe size={16} />}
              label="Website"
              sub="markus-begerow.de/linktree"
            />
            <ExternalLink
              href={LINKS.github}
              icon={<Github size={16} />}
              label="GitHub"
              sub="markusbegerow/opensidian"
            />
          </div>

          {/* Getting started */}
          <button
            onClick={() => { openOnboarding(); onClose(); }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors text-muted hover:text-accent text-sm font-medium"
          >
            <BookOpen size={15} />
            Getting Started
          </button>

          {/* Buy me a coffee */}
          <button
            onClick={() => openUrl(LINKS.coffee)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-colors text-yellow-500 font-medium text-sm"
          >
            <Coffee size={16} />
            Buy me a coffee
          </button>
        </div>
      </div>
    </div>
  );
}
