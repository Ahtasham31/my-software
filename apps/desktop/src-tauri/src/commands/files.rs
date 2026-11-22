use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

use crate::error::{AppError, CommandError};
use crate::state::AppState;
use crate::storage::safe_fs::{unique_filename, validate_within_root};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: Option<String>,
    pub extension: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DirListing {
    pub path: String,
    pub entries: Vec<FileEntry>,
}

#[tauri::command]
pub fn fs_browse(
    state: tauri::State<'_, AppState>,
    path: String,
) -> Result<DirListing, CommandError> {
    let root = PathBuf::from(&state.paths.root);
    let target = PathBuf::from(&path);
    if !target.exists() {
        return Err(AppError::NotFound(format!("Directory not found: {}", path)).into());
    }
    if !target.starts_with(&root) {
        return Err(AppError::PermissionDenied("Path outside storage root".into()).into());
    }

    let mut entries = Vec::new();
    for entry in fs::read_dir(&target)? {
        let entry = entry?;
        let meta = entry.metadata()?;
        let modified = meta.modified().ok().map(|t| {
            let dt: chrono::DateTime<chrono::Utc> = t.into();
            dt.to_rfc3339()
        });
        entries.push(FileEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            is_dir: meta.is_dir(),
            size: meta.len(),
            modified,
            extension: entry
                .path()
                .extension()
                .map(|e| e.to_string_lossy().to_string()),
        });
    }
    entries.sort_by(|a, b| {
        b.is_dir
            .cmp(&a.is_dir)
            .then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(DirListing {
        path: target.to_string_lossy().to_string(),
        entries,
    })
}

#[tauri::command]
pub fn fs_create_folder(
    state: tauri::State<'_, AppState>,
    parent: String,
    name: String,
) -> Result<String, CommandError> {
    let root = PathBuf::from(&state.paths.root);
    let parent_path = PathBuf::from(&parent);
    validate_within_root(&parent_path, &root)?;
    let target = parent_path.join(&name);
    if target.exists() {
        return Err(AppError::InvalidInput("Folder already exists".into()).into());
    }
    fs::create_dir_all(&target)?;
    Ok(target.to_string_lossy().to_string())
}

#[tauri::command]
pub fn fs_import_file(
    state: tauri::State<'_, AppState>,
    source: String,
    destination_dir: String,
) -> Result<String, CommandError> {
    let root = PathBuf::from(&state.paths.root);
    let src = PathBuf::from(&source);
    if !src.exists() || !src.is_file() {
        return Err(AppError::NotFound("Source file not found".into()).into());
    }
    let dst_dir = PathBuf::from(&destination_dir);
    validate_within_root(&dst_dir, &root)?;
    fs::create_dir_all(&dst_dir)?;
    let file_name = src
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("imported");
    let target = unique_filename(&dst_dir, file_name);
    fs::copy(&src, &target)?;
    Ok(target.to_string_lossy().to_string())
}

#[tauri::command]
pub fn fs_rename_path(
    state: tauri::State<'_, AppState>,
    path: String,
    new_name: String,
) -> Result<String, CommandError> {
    let root = PathBuf::from(&state.paths.root);
    let src = PathBuf::from(&path);
    validate_within_root(&src, &root)?;
    let parent = src
        .parent()
        .ok_or_else(|| AppError::InvalidInput("Invalid path".into()))?;
    let dst = parent.join(&new_name);
    if dst.exists() {
        return Err(AppError::InvalidInput("Target already exists".into()).into());
    }
    fs::rename(&src, &dst)?;
    Ok(dst.to_string_lossy().to_string())
}

#[tauri::command]
pub fn fs_delete_path(state: tauri::State<'_, AppState>, path: String) -> Result<(), CommandError> {
    let root = PathBuf::from(&state.paths.root);
    let target = PathBuf::from(&path);
    validate_within_root(&target, &root)?;
    if target.is_dir() {
        fs::remove_dir_all(&target)?;
    } else {
        fs::remove_file(&target)?;
    }
    Ok(())
}

#[tauri::command]
pub fn fs_reveal_in_os(path: String) -> Result<(), CommandError> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(AppError::NotFound("Path not found".into()).into());
    }
    #[cfg(target_os = "windows")]
    let cmd = std::process::Command::new("explorer")
        .arg("/select,")
        .arg(path)
        .spawn();
    #[cfg(target_os = "macos")]
    let cmd = std::process::Command::new("open")
        .arg("-R")
        .arg(&path)
        .spawn();
    #[cfg(target_os = "linux")]
    let cmd = std::process::Command::new("xdg-open")
        .arg(p.parent().unwrap_or(p))
        .spawn();

    cmd.map_err(|e| AppError::Internal(e.to_string()))?;
    Ok(())
}
