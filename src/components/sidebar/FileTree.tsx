import { useState, useRef, useEffect, useCallback } from "react";
import { useFileTree } from "../../hooks/useFileTree";
import { FileTreeNode } from "./FileTreeNode";
import { CreateNoteDialog } from "./CreateNoteDialog";
import { CreateFolderDialog } from "./CreateFolderDialog";
import type { FileNode } from "../../types/vault";
import { deleteFile, renameFile, basename, dirname } from "../../lib/tauriFs";
import { useVaultStore } from "../../store/vaultStore";

interface ContextMenu {
  x: number;
  y: number;
  node: FileNode;
}

export function FileTree() {
  const tree = useFileTree();
  const refreshFiles = useVaultStore((s) => s.refreshFiles);

  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [renaming, setRenaming] = useState<FileNode | null>(null);
  const [newName, setNewName] = useState("");

  const [creatingIn, setCreatingIn] = useState<string | null>(null);
  const [creatingFolderIn, setCreatingFolderIn] = useState<string | null>(null);

  // Visual state (triggers re-renders)
  const [draggingPath, setDraggingPath] = useState<string | null>(null);
  const [dropTargetPath, setDropTargetPath] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; name: string } | null>(null);

  // Mutable refs — safe to read inside event listeners without stale closures
  const sourcePath = useRef<string | null>(null);
  const sourceName = useRef<string>("");
  const sourceIsDir = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const dragActive = useRef(false);
  const currentDropTarget = useRef<string | null>(null);
  const activePointerId = useRef<number>(-1);

  // ── Context menu ──────────────────────────────────────────────────────────

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const closeMenu = () => setContextMenu(null);

  const handleDelete = async () => {
    if (!contextMenu) return;
    await deleteFile(contextMenu.node.path);
    await refreshFiles();
    closeMenu();
  };

  const handleStartRename = () => {
    if (!contextMenu) return;
    setRenaming(contextMenu.node);
    setNewName(contextMenu.node.name);
    closeMenu();
  };

  const handleRename = async () => {
    if (!renaming) return;
    const trimmed = newName.trim();
    if (!trimmed) return;
    const dir = dirname(renaming.path);
    const newPath = `${dir}/${trimmed}`;
    if (newPath === renaming.path) { setRenaming(null); return; } // no change
    try {
      await renameFile(renaming.path, newPath);
    } catch (err) {
      console.error("Rename failed:", err);
    }
    await refreshFiles();
    setRenaming(null);
  };

  const targetDir = (node: FileNode) =>
    node.is_dir ? node.path : node.path.substring(0, node.path.lastIndexOf("/"));

  const handleStartCreate = () => {
    if (!contextMenu) return;
    setCreatingIn(targetDir(contextMenu.node));
    closeMenu();
  };

  const handleStartCreateFolder = () => {
    if (!contextMenu) return;
    setCreatingFolderIn(targetDir(contextMenu.node));
    closeMenu();
  };

  // ── Pointer-based drag and drop ───────────────────────────────────────────

  const resetDrag = useCallback(() => {
    sourcePath.current = null;
    sourceIsDir.current = false;
    dragActive.current = false;
    currentDropTarget.current = null;
    activePointerId.current = -1;
    setDraggingPath(null);
    setDropTargetPath(null);
    setDragPreview(null);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, node: FileNode) => {
    // Only left-button; ignore right-click so contextmenu still fires
    if (e.button !== 0) return;

    sourcePath.current = node.path;
    sourceName.current = node.name;
    sourceIsDir.current = node.is_dir;
    startPos.current = { x: e.clientX, y: e.clientY };
    dragActive.current = false;
    currentDropTarget.current = null;
    activePointerId.current = e.pointerId;
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId.current) return;
      if (!sourcePath.current) return;

      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;

      if (!dragActive.current) {
        if (Math.sqrt(dx * dx + dy * dy) < 5) return;
        dragActive.current = true;
        setDraggingPath(sourcePath.current);
      }

      setDragPreview({ x: e.clientX, y: e.clientY, name: sourceName.current });

      // elementFromPoint works geometrically — unaffected by pointer capture
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const row = el?.closest('[data-path]');
      const targetPath = row?.getAttribute('data-path') ?? null;
      const isDir = row?.getAttribute('data-is-dir') === 'true';

      const src = sourcePath.current!; // non-null: guarded by check above
      // Prevent dropping a folder into itself or its own descendant.
      const wouldLoop = sourceIsDir.current && src.startsWith(targetPath + '/');
      // Prevent dropping into hidden directories (.templates, .configs, etc.)
      const isHiddenTarget = targetPath !== null &&
        targetPath.split('/').some((seg) => seg.startsWith('.'));
      const valid =
        targetPath !== null &&
        isDir &&
        !isHiddenTarget &&
        targetPath !== src &&
        !wouldLoop;

      const next = valid ? targetPath : null;
      currentDropTarget.current = next;
      setDropTargetPath(next);
    };

    const onUp = async (e: PointerEvent) => {
      if (e.pointerId !== activePointerId.current) return;
      if (!sourcePath.current) return;

      // Capture before resetDrag clears refs
      const src = sourcePath.current;
      const dst = currentDropTarget.current;
      const wasActive = dragActive.current;

      resetDrag();

      if (!wasActive || !dst || !src) return;

      const name = basename(src);
      const newPath = `${dst}/${name}`;
      if (newPath !== src) {
        try {
          await renameFile(src, newPath);
        } catch (err) {
          console.error("Move failed:", err);
        }
        await refreshFiles();
      }
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
  }, [resetDrag, refreshFiles]);

  return (
    <div
      className="flex-1 overflow-y-auto"
      role="tree"
      onClick={contextMenu ? closeMenu : undefined}
    >
      {tree.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={0}
          onContextMenu={handleContextMenu}
          onPointerDown={handlePointerDown}
          draggingPath={draggingPath}
          dropTargetPath={dropTargetPath}
        />
      ))}

      {/* Floating drag preview label */}
      {dragPreview && (
        <div
          className="fixed z-[999] pointer-events-none bg-surface border border-border rounded px-2 py-1 text-xs text-text shadow"
          style={{ left: dragPreview.x + 12, top: dragPreview.y + 12 }}
        >
          {dragPreview.name.replace(/\.md$/, "")}
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-surface border border-border rounded shadow-lg py-1 text-sm"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full text-left px-4 py-1.5 hover:bg-white/10"
            onClick={handleStartCreate}
          >
            New note
          </button>
          <button
            className="w-full text-left px-4 py-1.5 hover:bg-white/10"
            onClick={handleStartCreateFolder}
          >
            New folder
          </button>
          <div className="my-1 border-t border-border" />
          <button
            className="w-full text-left px-4 py-1.5 hover:bg-white/10"
            onClick={handleStartRename}
          >
            Rename
          </button>
          <button
            className="w-full text-left px-4 py-1.5 hover:bg-white/10 text-red-400"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}

      {/* New file dialog */}
      {creatingIn !== null && (
        <CreateNoteDialog
          targetDir={creatingIn}
          onClose={() => setCreatingIn(null)}
          onCreated={refreshFiles}
        />
      )}

      {/* New folder dialog */}
      {creatingFolderIn !== null && (
        <CreateFolderDialog
          targetDir={creatingFolderIn}
          onClose={() => setCreatingFolderIn(null)}
          onCreated={refreshFiles}
        />
      )}

      {/* Rename dialog */}
      {renaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface border border-border rounded p-4 w-80">
            <p className="text-sm mb-2 text-muted">Rename</p>
            <input
              autoFocus
              className="w-full bg-base border border-border rounded px-3 py-1.5 text-sm text-text outline-none focus:border-accent"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") setRenaming(null);
              }}
            />
            <div className="flex gap-2 mt-3 justify-end">
              <button
                className="text-sm px-3 py-1 text-muted hover:text-text"
                onClick={() => setRenaming(null)}
              >
                Cancel
              </button>
              <button
                className="text-sm px-3 py-1 bg-accent/20 text-accent rounded hover:bg-accent/30"
                onClick={handleRename}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
