import { useMemo } from "react";
import type { VaultFile } from "../types/vault";
import type { FileNode } from "../types/vault";
import { useVaultStore } from "../store/vaultStore";

function buildTree(files: VaultFile[], parentPath: string): FileNode[] {
  const children = files
    .filter((f) => f.parent === parentPath)
    .map((f): FileNode => ({
      path: f.path,
      name: f.name,
      extension: f.extension,
      is_dir: f.is_dir,
      children: f.is_dir ? buildTree(files, f.path) : [],
    }));

  // Folders first, then alphabetical
  return children.sort((a, b) => {
    if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function useFileTree(): FileNode[] {
  const files = useVaultStore((s) => s.files);
  const vaultPath = useVaultStore((s) => s.vaultPath);

  return useMemo(() => {
    if (!vaultPath) return [];
    return buildTree(files, vaultPath);
  }, [files, vaultPath]);
}
