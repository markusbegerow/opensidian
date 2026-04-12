import { useState } from "react";
import { Settings, Info } from "lucide-react";
import { useEditorStore } from "../../store/editorStore";
import { useVaultStore } from "../../store/vaultStore";
import { useSettingsStore } from "../../store/settingsStore";
import { AboutModal } from "../settings/AboutModal";

function wordCount(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function StatusBar() {
  const content = useEditorStore((s) => s.content);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isIndexing = useVaultStore((s) => s.isIndexing);
  const openSettings = useSettingsStore((s) => s.open);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <div className="flex items-center gap-4 px-4 py-1 border-t border-border bg-surface text-xs text-muted shrink-0">
        {isIndexing && <span className="text-accent animate-pulse">Indexing vault…</span>}
        {isDirty && <span className="text-yellow-400">● Unsaved</span>}
        <span className="ml-auto">{wordCount(content)} words</span>
        <span>{content.length} chars</span>
        <button
          onClick={() => setShowAbout(true)}
          title="About"
          className="hover:text-accent transition-colors flex items-center"
        >
          <Info size={14} />
        </button>
        <button
          onClick={() => openSettings("appearance")}
          title="Settings"
          className="hover:text-accent transition-colors flex items-center"
        >
          <Settings size={14} />
        </button>
      </div>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
}
