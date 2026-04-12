import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";
import type { FileNode } from "../../types/vault";
import { useEditorStore } from "../../store/editorStore";

interface Props {
  node: FileNode;
  depth: number;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
  onPointerDown: (e: React.PointerEvent, node: FileNode) => void;
  draggingPath: string | null;
  dropTargetPath: string | null;
}

export function FileTreeNode({
  node,
  depth,
  onContextMenu,
  onPointerDown,
  draggingPath,
  dropTargetPath,
}: Props) {

  const [open, setOpen] = useState(true);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const openFile = useEditorStore((s) => s.openFile);

  const isActive = activeFilePath === node.path;
  const isDragging = draggingPath === node.path;
  const isDropTarget = dropTargetPath === node.path;
  const indent = depth * 12;

  const handleClick = () => {
    if (node.is_dir) {
      setOpen((v) => !v);
    } else {
      openFile(node.path);
    }
  };

  return (
    <div>
      <div
        data-path={node.path}
        data-is-dir={String(node.is_dir)}
        className={`flex items-center gap-1 py-0.5 px-2 cursor-pointer rounded select-none hover:bg-white/5
          ${isActive ? "bg-accent/20 text-accent" : "text-text"}
          ${isDragging ? "opacity-40" : ""}
          ${isDropTarget ? "bg-accent/30 ring-1 ring-accent ring-inset" : ""}
        `}
        style={{ paddingLeft: `${8 + indent}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, node)}
        onPointerDown={(e) => onPointerDown(e, node)}
        title={node.name}
      >
        {node.is_dir ? (
          <>
            <span className="text-muted w-3">
              {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
            {open ? (
              <FolderOpen size={14} className="text-accent shrink-0" />
            ) : (
              <Folder size={14} className="text-accent shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3" />
            <FileText size={14} className="text-muted shrink-0" />
          </>
        )}
        <span className="truncate text-sm">{node.name.replace(/\.md$/, "")}</span>
      </div>

      {node.is_dir && open && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onContextMenu={onContextMenu}
              onPointerDown={onPointerDown}
              draggingPath={draggingPath}
              dropTargetPath={dropTargetPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}
