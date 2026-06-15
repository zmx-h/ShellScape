use base64::Engine;
use std::fs;
use std::io::Read;
use std::path::Path;

/// Read a file and return it as a base64-encoded data URL for the browser to load directly.
/// This bypasses all asset protocol scope issues.
#[tauri::command]
pub fn read_file_as_data_url(path: String) -> Result<String, String> {
    let p = Path::new(&path);
    let ext = p.extension()
        .and_then(|e| e.to_str())
        .unwrap_or("png")
        .to_lowercase();

    let mime = match ext.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        "mp4" => "video/mp4",
        "webm" => "video/webm",
        "mov" => "video/quicktime",
        "ogv" | "ogg" => "video/ogg",
        _ => "application/octet-stream",
    };

    let mut buf = Vec::new();
    fs::File::open(&p)
        .and_then(|mut f| f.read_to_end(&mut buf))
        .map_err(|e| format!("Failed to read file '{}': {}", path, e))?;

    let b64 = base64::engine::general_purpose::STANDARD.encode(&buf);
    Ok(format!("data:{};base64,{}", mime, b64))
}
