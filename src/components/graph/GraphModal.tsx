import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { GraphCanvas } from "./GraphCanvas";
import { useGraph } from "../../hooks/useGraph";
import { ChatPanel } from "../chat/ChatPanel";
import { StatusBar } from "../layout/StatusBar";

interface Props {
  onClose: () => void;
}

export function GraphModal({ onClose }: Props) {
  const { nodes, edges } = useGraph();

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-base">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface shrink-0">
        <span className="text-sm font-medium">Graph View</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {nodes.length} notes · {edges.length} links
          </span>
          <button
            className="p-1 rounded hover:bg-white/10 text-muted hover:text-text"
            onClick={onClose}
            aria-label="Close graph"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Canvas + Chat (resizable) */}
      <PanelGroup direction="horizontal" className="flex-1 min-h-0">
        <Panel defaultSize={72} minSize={40}>
          {nodes.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted text-sm text-center px-8">
              No notes found. Open a vault, or check that your notes are not inside hidden folders (names starting with&nbsp;.).
            </div>
          ) : (
            <GraphCanvas nodes={nodes} edges={edges} onClose={onClose} />
          )}
        </Panel>
        <PanelResizeHandle className="w-px bg-border hover:bg-accent transition-colors cursor-col-resize" />
        <Panel defaultSize={28} minSize={20} maxSize={50}>
          <ChatPanel vaultMode onNavigate={onClose} />
        </Panel>
      </PanelGroup>
      <StatusBar />
    </div>,
    document.body
  );
}
