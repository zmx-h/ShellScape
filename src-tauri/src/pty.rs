use portable_pty::{CommandBuilder, PtySize, MasterPty};
use serde::{Deserialize, Serialize};
use std::{
    io::{Read, Write as _},
    sync::Mutex,
    thread,
};
use tauri::{AppHandle, Emitter, Manager, State};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PidInfo {
    pub pid: u32,
}

pub struct PtyState {
    #[allow(dead_code)]
    pid: u32,
    #[allow(dead_code)]
    master: Mutex<Box<dyn MasterPty + Send>>,
    writer: Mutex<Box<dyn std::io::Write + Send>>,
}

#[tauri::command]
pub fn resize_pty(state: State<'_, PtyState>, rows: u16, cols: u16) -> Result<(), String> {
    let size = PtySize {
        rows,
        cols,
        pixel_width: 0,
        pixel_height: 0,
    };
    state.master.lock().map_err(|e| e.to_string())?.resize(size).map_err(|e| e.to_string())?;
    log::info!("Terminal resize: {}x{}", cols, rows);
    Ok(())
}

pub fn spawn_pty(app: &AppHandle) -> Result<PidInfo, String> {
    let shell = {
        #[cfg(target_os = "windows")]
        { "powershell.exe" }
        #[cfg(not(target_os = "windows"))]
        { "/bin/bash" }
    };

    log::info!("[PTY] Spawning shell: {}", shell);

    let pty_system = portable_pty::native_pty_system();

    let size = PtySize {
        rows: 30,
        cols: 100,
        pixel_width: 0,
        pixel_height: 0,
    };

    let pair = pty_system
        .openpty(size)
        .map_err(|e| format!("Failed to open PTY: {}", e))?;

    let mut cmd = CommandBuilder::new(shell);
    #[cfg(target_os = "windows")]
    {
        cmd.args(["-NoLogo", "-NoExit"]);
        cmd.cwd(std::env::current_dir().unwrap_or_default());
    }
    #[cfg(not(target_os = "windows"))]
    {
        cmd.cwd(std::env::current_dir().unwrap_or_default());
    }

    // Set TERM environment variable for proper terminal behavior
    cmd.env("TERM", "xterm-256color");

    log::info!("[PTY] Opening pair and spawning command...");
    let child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn shell: {}", e))?;

    let pid = child.process_id().unwrap_or(0);
    log::info!("[PTY] Shell spawned with PID: {}", pid);

    // Keep child alive — dropping it on Windows closes the pseudoconsole.
    // We store it in a leaked Box so the PTY stays alive for the app lifetime.
    Box::leak(Box::new(child));

    let app_handle = app.clone();
    let mut reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;
    let writer: Box<dyn std::io::Write + Send> = Box::new(
        pair.master.take_writer().map_err(|e| e.to_string())?
    );

    // Store master in state so it stays alive
    let master = pair.master;

    // Spawn reader thread
    thread::spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => {
                    log::info!("[PTY reader] EOF (process exited)");
                    break;
                }
                Ok(n) => {
                    let data = String::from_utf8_lossy(&buf[..n]).to_string();
                    log::debug!("[PTY reader] Read {} bytes", n);
                    if let Err(e) = app_handle.emit("pty-output", data) {
                        log::error!("[PTY reader] Failed to emit pty-output: {}", e);
                        break;
                    }
                }
                Err(e) => {
                    log::error!("[PTY reader] Read error: {}", e);
                    break;
                }
            }
        }
        let _ = app_handle.emit("pty-exit", ());
        log::info!("[PTY reader] Thread exiting");
    });

    app.manage(PtyState {
        pid,
        master: Mutex::new(master),
        writer: Mutex::new(writer),
    });

    Ok(PidInfo { pid })
}

#[tauri::command]
pub fn write_pty(state: State<'_, PtyState>, data: String) -> Result<(), String> {
    log::debug!("[write_pty] Writing {} bytes", data.len());
    let mut writer = state.writer.lock().map_err(|e| e.to_string())?;
    writer
        .write_all(data.as_bytes())
        .map_err(|e| {
            log::error!("[write_pty] Write error: {}", e);
            format!("Write error: {}", e)
        })?;
    writer.flush().map_err(|e| format!("Flush error: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn get_settings_path() -> Result<String, String> {
    let config_dir = dirs_next::config_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("clibg")
        .join("settings.json");
    Ok(config_dir.to_string_lossy().to_string())
}
