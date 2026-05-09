use serde::{Deserialize, Serialize};
use std::path::Path;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VaultFile {
    pub path: String,
    pub name: String,
    pub extension: String,
    pub is_dir: bool,
    pub parent: String,
}

/// Walk the vault directory and return all files/folders.
#[tauri::command]
pub fn open_vault(path: String) -> Result<Vec<VaultFile>, String> {
    let root = Path::new(&path);
    if !root.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    let mut files = Vec::new();
    for entry in WalkDir::new(root)
        .min_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let p = entry.path();
        let path_str = normalize_path(p.to_string_lossy().as_ref());
        let name = p
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();
        let extension = p
            .extension()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();
        let parent = normalize_path(
            p.parent()
                .unwrap_or(root)
                .to_string_lossy()
                .as_ref(),
        );

        // Skip hidden files/folders (starting with .)
        if name.starts_with('.') {
            continue;
        }

        files.push(VaultFile {
            path: path_str,
            name,
            extension,
            is_dir: p.is_dir(),
            parent,
        });
    }

    Ok(files)
}

/// Read a single file's UTF-8 content.
#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

/// Batch read multiple files at once (avoids many IPC round-trips during indexing).
#[tauri::command]
pub fn read_files_batch(paths: Vec<String>) -> Vec<(String, Result<String, String>)> {
    paths
        .into_iter()
        .map(|p| {
            let content = std::fs::read_to_string(&p).map_err(|e| e.to_string());
            (p, content)
        })
        .collect()
}

/// Atomic write: write to .tmp then rename to final path.
#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    let tmp_path = format!("{}.tmp", path);
    std::fs::write(&tmp_path, &content).map_err(|e| e.to_string())?;
    std::fs::rename(&tmp_path, &path).map_err(|e| e.to_string())?;
    Ok(())
}

/// Move a file to the OS trash instead of permanently deleting it.
#[tauri::command]
pub fn delete_file(path: String) -> Result<(), String> {
    trash::delete(&path).map_err(|e| e.to_string())
}

/// Rename (move) a file or directory.
#[tauri::command]
pub fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    std::fs::rename(&old_path, &new_path).map_err(|e| e.to_string())
}

/// Create a new empty markdown file.
#[tauri::command]
pub fn create_file(path: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::write(&path, "").map_err(|e| e.to_string())
}

/// Create a new directory (including all parents).
#[tauri::command]
pub fn create_directory(path: String) -> Result<(), String> {
    std::fs::create_dir_all(&path).map_err(|e| e.to_string())
}

fn normalize_path(path: &str) -> String {
    path.replace('\\', "/")
}
