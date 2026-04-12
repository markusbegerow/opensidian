import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { GraphCanvas } from "./GraphCanvas";
import { useGraph } from "../../hooks/useGraph";

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

      {/* Canvas */}
      <div className="flex-1 min-h-0">
        {nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted text-sm text-center px-8">
            No notes found. Open a vault, or check that your notes are not inside hidden folders (names starting with&nbsp;.).
          </div>
        ) : (
          <GraphCanvas nodes={nodes} edges={edges} onClose={onClose} />
        )}
      </div>
    </div>,
    document.body
  );
}
