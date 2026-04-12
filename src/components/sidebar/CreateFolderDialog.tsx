import { useState } from "react";
import { useVaultStore } from "../../store/vaultStore";
import { createDirectory } from "../../lib/tauriFs";

interface Props {
  targetDir: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateFolderDialog({ targetDir, onClose, onCreated }: Props) {
  const files = useVaultStore((s) => s.files);
  const vaultPath = useVaultStore((s) => s.vaultPath) ?? "";

  const [name, setName] = useState("");
  const [selectedDir, setSelectedDir] = useState(targetDir);

  const folders = [
    { path: vaultPath, label: "/" },
    ...files
      .filter(
        (f) =>
          f.is_dir &&
          !f.path.split("/").some((seg) => seg.startsWith("."))
      )
      .map((f) => ({
        path: f.path,
        label: f.path.replace(vaultPath + "/", ""),
      })),
  ];

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createDirectory(`${selectedDir}/${trimmed}`);
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-border rounded p-4 w-80 shadow-xl">
        <p className="text-sm font-medium mb-3">New folder</p>

        <label className="block text-xs text-muted mb-1">Name</label>
        <input
          autoFocus
          placeholder="Folder name..."
          className="w-full bg-base border border-border rounded px-3 py-1.5 text-sm text-text outline-none focus:border-accent mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
            if (e.key === "Escape") onClose();
          }}
        />

        <label className="block text-xs text-muted mb-1">Location</label>
        <select
          className="w-full bg-base border border-border rounded px-3 py-1.5 text-sm text-text outline-none focus:border-accent mb-3"
          value={selectedDir}
          onChange={(e) => setSelectedDir(e.target.value)}
        >
          {folders.map((f) => (
            <option key={f.path} value={f.path}>
              {f.label}
            </option>
          ))}
        </select>

        <div className="flex gap-2 justify-end">
          <button
            className="text-sm px-3 py-1 text-muted hover:text-text"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="text-sm px-3 py-1 bg-accent/20 text-accent rounded hover:bg-accent/30 disabled:opacity-40"
            disabled={!name.trim()}
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
