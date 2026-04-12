mod commands;

use commands::{
    dialog_commands::pick_vault_folder,
    fs_commands::{
        create_directory, create_file, delete_file, open_vault, read_file, read_files_batch,
        rename_file, write_file,
    },
    watcher_commands::{unwatch_vault, watch_vault, WatcherState},
};
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(WatcherState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            open_vault,
            read_file,
            read_files_batch,
            write_file,
            delete_file,
            rename_file,
            create_file,
            create_directory,
            pick_vault_folder,
            watch_vault,
            unwatch_vault,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
