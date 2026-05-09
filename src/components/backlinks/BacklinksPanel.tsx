import { Link } from "lucide-react";
import { useBacklinks } from "../../hooks/useBacklinks";
import { useEditorStore } from "../../store/editorStore";

export function BacklinksPanel() {
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const openFile = useEditorStore((s) => s.openFile);
  const backlinks = useBacklinks(activeFilePath);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Link size={14} className="text-accent" />
        <span className="text-sm font-medium">Backlinks</span>
        {backlinks.length > 0 && (
          <span className="ml-auto text-xs text-muted">{backlinks.length}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {backlinks.length === 0 ? (
          <p className="text-muted text-xs px-3 py-4">No backlinks</p>
        ) : (
          backlinks.map((entry) => (
            <button
              key={entry.sourcePath}
              className="w-full text-left px-3 py-2 border-b border-border/50 hover:bg-white/5 transition-colors"
              onClick={() => openFile(entry.sourcePath)}
            >
              <p className="text-sm text-accent font-medium truncate">
                {entry.sourceName}
              </p>
              <p className="text-xs text-muted mt-0.5 truncate">{entry.excerpt}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
