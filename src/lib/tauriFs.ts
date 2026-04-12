import { invoke } from "@tauri-apps/api/core";
import type { VaultFile } from "../types/vault";

/** Normalize all backslashes to forward slashes */
export function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

export function basename(path: string, ext?: string): string {
  const name = path.split("/").pop() ?? path;
  if (ext && name.endsWith(ext)) return name.slice(0, -ext.length);
  return name;
}

export function dirname(path: string): string {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/");
}

export async function openVault(path: string): Promise<VaultFile[]> {
  const files = await invoke<VaultFile[]>("open_vault", { path });
  return files.map((f) => ({
    ...f,
    path: normalizePath(f.path),
    parent: normalizePath(f.parent),
  }));
}

export async function readFile(path: string): Promise<string> {
  return invoke<string>("read_file", { path });
}

export async function readFilesBatch(
  paths: string[]
): Promise<Array<[string, string | null]>> {
  const results = await invoke<Array<[string, { Ok: string } | { Err: string }]>>(
    "read_files_batch",
    { paths }
  );
  return results.map(([p, result]) => {
    if ("Ok" in result) return [p, result.Ok];
    return [p, null];
  });
}

export async function writeFile(path: string, content: string): Promise<void> {
  return invoke("write_file", { path, content });
}

export async function deleteFile(path: string): Promise<void> {
  return invoke("delete_file", { path });
}

export async function renameFile(oldPath: string, newPath: string): Promise<void> {
  return invoke("rename_file", { oldPath, newPath });
}

export async function createFile(path: string): Promise<void> {
  return invoke("create_file", { path });
}

export async function createDirectory(path: string): Promise<void> {
  return invoke("create_directory", { path });
}

export async function pickVaultFolder(): Promise<string | null> {
  return invoke<string | null>("pick_vault_folder");
}
