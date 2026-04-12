import { useState, useEffect } from "react";
import { useVaultStore } from "../../store/vaultStore";
import { createFile, writeFile, readFile, basename } from "../../lib/tauriFs";

interface Props {
  targetDir: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateNoteDialog({ targetDir, onClose, onCreated }: Props) {
  const files = useVaultStore((s) => s.files);
  const vaultPath = useVaultStore((s) => s.vaultPath) ?? "";

  const [name, setName] = useState("");
  const [selectedDir, setSelectedDir] = useState(targetDir);
  const [templatePath, setTemplatePath] = useState<string>("__none__");

  // All visible (non-hidden) folders in vault, plus vault root
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

  // Find all files inside any `.templates` directory
  const templates = files.filter(
    (f) =>
      !f.is_dir &&
      f.path.split("/").some((seg) => seg.toLowerCase() === ".templates")
  );

  useEffect(() => {
    if (templates.length === 1) setTemplatePath(templates[0].path);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const fileName = trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
    const newPath = `${selectedDir}/${fileName}`;

    if (templatePath !== "__none__") {
      const content = await readFile(templatePath);
      await writeFile(newPath, content);
    } else {
      await createFile(newPath);
    }

    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-border rounded p-4 w-80 shadow-xl">
        <p className="text-sm font-medium mb-3">New note</p>

        <label className="block text-xs text-muted mb-1">Name</label>
        <input
          autoFocus
          placeholder="Note name..."
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

        {templates.length > 0 && (
          <>
            <label className="block text-xs text-muted mb-1">Template</label>
            <select
              className="w-full bg-base border border-border rounded px-3 py-1.5 text-sm text-text outline-none focus:border-accent mb-3"
              value={templatePath}
              onChange={(e) => setTemplatePath(e.target.value)}
            >
              <option value="__none__">— No template —</option>
              {templates.map((t) => (
                <option key={t.path} value={t.path}>
                  {basename(t.name, ".md")}
                </option>
              ))}
            </select>
          </>
        )}

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
