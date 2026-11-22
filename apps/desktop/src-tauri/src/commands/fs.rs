use std::path::PathBuf;

use crate::error::CommandError;
use crate::state::AppState;
use crate::storage::safe_fs;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileMetadata {
    pub size: u64,
    pub is_dir: bool,
    pub modified: Option<String>,
}

#[tauri::command]
pub fn fs_metadata(
    _state: tauri::State<'_, AppState>,
    path: String,
) -> Result<FileMetadata, CommandError> {
    let p = PathBuf::from(&path);
    let meta = std::fs::metadata(&p)?;
    let modified = meta.modified().ok().map(|t| {
        let dt: chrono::DateTime<chrono::Utc> = t.into();
        dt.to_rfc3339()
    });

    Ok(FileMetadata {
        size: meta.len(),
        is_dir: meta.is_dir(),
        modified,
    })
}

#[tauri::command]
pub fn fs_safe_write(
    state: tauri::State<'_, AppState>,
    path: String,
    data: Vec<u8>,
) -> Result<(), CommandError> {
    let root = PathBuf::from(&state.paths.root);
    safe_fs::safe_write(&PathBuf::from(path), &data, &root)?;
    Ok(())
}
