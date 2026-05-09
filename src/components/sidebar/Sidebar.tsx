import { useState, useRef, useEffect, useCallback } from "react";
import { FolderOpen, Plus, FolderInput, FileText, FolderPlus } from "lucide-react";
import { FileTree } from "./FileTree";
import { CreateNoteDialog } from "./CreateNoteDialog";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { useVaultStore } from "../../store/vaultStore";
import { basename } from "../../lib/tauriFs";

export function Sidebar() {
  const vaultPath = useVaultStore((s) => s.vaultPath);
  const pickAndOpenVault = useVaultStore((s) => s.pickAndOpenVault);
  const refreshFiles = useVaultStore((s) => s.refreshFiles);

  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [creatingNote, setCreatingNote] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);

  const plusRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openPlusMenu = useCallback(() => {
    if (!vaultPath || !plusRef.current) return;
    const rect = plusRef.current.getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom + 4 });
    setShowPlusMenu(true);
  }, [vaultPath]);

  // Close plus menu on outside click
  useEffect(() => {
    if (!showPlusMenu) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!plusRef.current?.contains(t) && !menuRef.current?.contains(t)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPlusMenu]);

  const vaultName = vaultPath ? basename(vaultPath) : "No vault";

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <FolderOpen size={14} className="text-accent shrink-0" />
          <span className="text-sm font-medium truncate" title={vaultPath ?? ""}>
            {vaultName}
          </span>
        </div>
        <div className="flex gap-1">
          {/* + button with dropdown */}
          <div className="relative">
            <button
              ref={plusRef}
              className="p-1 rounded hover:bg-white/10 text-muted hover:text-text"
              title="New…"
              onClick={openPlusMenu}
            >
              <Plus size={14} />
            </button>

            {showPlusMenu && (
              <div
                ref={menuRef}
                className="fixed z-[200] bg-surface border border-border rounded shadow-lg py-1 w-36 text-sm"
                style={{ left: menuPos.x, top: menuPos.y }}
              >
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 text-left"
                  onClick={() => { setCreatingNote(true); setShowPlusMenu(false); }}
                >
                  <FileText size={13} className="text-muted shrink-0" />
                  New note
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 text-left"
                  onClick={() => { setCreatingFolder(true); setShowPlusMenu(false); }}
                >
                  <FolderPlus size={13} className="text-muted shrink-0" />
                  New folder
                </button>
              </div>
            )}
          </div>

          <button
            className="p-1 rounded hover:bg-white/10 text-muted hover:text-text"
            title="Open vault"
            onClick={pickAndOpenVault}
          >
            <FolderInput size={14} />
          </button>
        </div>
      </div>

      {/* File tree */}
      <FileTree />

      {/* New note dialog */}
      {creatingNote && vaultPath && (
        <CreateNoteDialog
          targetDir={vaultPath}
          onClose={() => setCreatingNote(false)}
          onCreated={refreshFiles}
        />
      )}

      {/* New folder dialog */}
      {creatingFolder && vaultPath && (
        <CreateFolderDialog
          targetDir={vaultPath}
          onClose={() => setCreatingFolder(false)}
          onCreated={refreshFiles}
        />
      )}
    </div>
  );
}
