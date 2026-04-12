import { useState } from "react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels";
import { Columns2, FileText, Eye } from "lucide-react";
import { CodeMirrorEditor } from "./CodeMirrorEditor";
import { MarkdownPreview } from "./MarkdownPreview";
import { useEditorStore } from "../../store/editorStore";
import { basename } from "../../lib/tauriFs";

type ViewMode = "split" | "editor" | "preview";

export function EditorPane() {
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const isDirty = useEditorStore((s) => s.isDirty);
  const [mode, setMode] = useState<ViewMode>("split");

  if (!activeFilePath) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <p>Open a file to start editing</p>
      </div>
    );
  }

  const fileName = basename(activeFilePath, ".md");

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-surface shrink-0">
        <span className="text-sm font-medium truncate">
          {fileName}
          {isDirty && <span className="text-muted ml-1">•</span>}
        </span>
        <div className="flex gap-1">
          <button
            className={`p-1.5 rounded text-xs ${mode === "editor" ? "bg-accent/20 text-accent" : "text-muted hover:text-text"}`}
            onClick={() => setMode("editor")}
            title="Editor only"
          >
            <FileText size={14} />
          </button>
          <button
            className={`p-1.5 rounded text-xs ${mode === "split" ? "bg-accent/20 text-accent" : "text-muted hover:text-text"}`}
            onClick={() => setMode("split")}
            title="Split view"
          >
            <Columns2 size={14} />
          </button>
          <button
            className={`p-1.5 rounded text-xs ${mode === "preview" ? "bg-accent/20 text-accent" : "text-muted hover:text-text"}`}
            onClick={() => setMode("preview")}
            title="Preview only"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Editor / Preview area */}
      <div className="flex-1 min-h-0">
        {mode === "editor" && (
          <div className="h-full">
            <CodeMirrorEditor />
          </div>
        )}
        {mode === "preview" && (
          <div className="h-full overflow-y-auto">
            <MarkdownPreview />
          </div>
        )}
        {mode === "split" && (
          <PanelGroup direction="horizontal" autoSaveId="editor-split">
            <Panel defaultSize={50} minSize={20}>
              <CodeMirrorEditor />
            </Panel>
            <PanelResizeHandle className="w-px bg-border hover:bg-accent transition-colors" />
            <Panel defaultSize={50} minSize={20}>
              <MarkdownPreview />
            </Panel>
          </PanelGroup>
        )}
      </div>
    </div>
  );
}
