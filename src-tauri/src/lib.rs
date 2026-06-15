mod commands;
mod pty;

use tauri::Emitter;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let handle = app.handle().clone();
            match pty::spawn_pty(&handle) {
                Ok(info) => log::info!("PTY spawned pid={}", info.pid),
                Err(e) => log::error!("PTY spawn error: {}", e),
            }
            let window = app.get_webview_window("main").unwrap();
            let w = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::Resized(_) = event {
                    let _ = w.emit("window-resized", ());
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            pty::write_pty,
            pty::resize_pty,
            pty::get_settings_path,
            commands::read_file_as_data_url,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
