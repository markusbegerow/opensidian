use tauri_plugin_dialog::DialogExt;

/// Open a native folder picker dialog and return the chosen path.
#[tauri::command]
pub async fn pick_vault_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let folder = app
        .dialog()
        .file()
        .blocking_pick_folder();

    Ok(folder.map(|p| p.to_string().replace('\\', "/")))
}
