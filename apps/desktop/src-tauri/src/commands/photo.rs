use std::path::PathBuf;

use base64::{engine::general_purpose::STANDARD, Engine as _};
use serde::{Deserialize, Serialize};

use crate::error::{AppError, CommandError};
use crate::state::AppState;

const SUPPORTED: &[&str] = &["jpg", "jpeg", "png", "webp", "bmp", "tiff", "tif"];

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoadedImage {
    pub path: String,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub format: String,
    pub size_bytes: u64,
    pub data_url: String,
}

#[tauri::command]
pub fn photo_load_image(path: String) -> Result<LoadedImage, CommandError> {
    let p = PathBuf::from(&path);
    if !p.exists() || !p.is_file() {
        return Err(AppError::NotFound(format!("Image not found: {}", path)).into());
    }

    let format = p
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_lowercase())
        .ok_or_else(|| AppError::InvalidInput("File has no extension".into()))?;

    if !SUPPORTED.contains(&format.as_str()) {
        return Err(AppError::InvalidInput(format!("Unsupported image format: {}", format)).into());
    }

    let mime = match format.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        "tiff" | "tif" => "image/tiff",
        _ => "application/octet-stream",
    };

    let bytes = std::fs::read(&p)?;
    let size_bytes = bytes.len() as u64;

    let img = image::load_from_memory(&bytes)
        .map_err(|e| AppError::InvalidInput(format!("Failed to decode image: {}", e)))?;
    let width = img.width();
    let height = img.height();

    let encoded = STANDARD.encode(&bytes);
    let data_url = format!("data:{};base64,{}", mime, encoded);

    Ok(LoadedImage {
        path: p.to_string_lossy().to_string(),
        name: p
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("image")
            .to_string(),
        width,
        height,
        format,
        size_bytes,
        data_url,
    })
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveImageInput {
    pub path: String,
    pub data_url: String,
}

#[tauri::command]
pub fn photo_save_image(input: SaveImageInput) -> Result<String, CommandError> {
    let b64 = input
        .data_url
        .split(',')
        .nth(1)
        .ok_or_else(|| AppError::InvalidInput("Invalid data URL".into()))?;

    let bytes = STANDARD
        .decode(b64)
        .map_err(|e| AppError::InvalidInput(format!("Bad base64: {}", e)))?;

    let dest = PathBuf::from(&input.path);
    if let Some(parent) = dest.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&dest, &bytes)?;

    Ok(dest.to_string_lossy().to_string())
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PhotoProject {
    pub id: String,
    pub name: String,
    pub project_path: String,
    pub source_path: Option<String>,
    pub width: i64,
    pub height: i64,
    pub format: String,
    pub metadata_json: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveProjectInput {
    pub name: String,
    pub source_path: Option<String>,
    pub width: i64,
    pub height: i64,
    pub format: String,
    pub metadata_json: Option<String>,
}

#[tauri::command]
pub fn photo_projects_list(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<PhotoProject>, CommandError> {
    let conn = state.db.get()?;
    let mut stmt = conn.prepare(
        "SELECT id, name, project_path, source_path, width, height, format,
                metadata_json, created_at, updated_at
         FROM photo_projects ORDER BY updated_at DESC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(PhotoProject {
            id: r.get(0)?,
            name: r.get(1)?,
            project_path: r.get(2)?,
            source_path: r.get(3)?,
            width: r.get(4)?,
            height: r.get(5)?,
            format: r.get(6)?,
            metadata_json: r.get(7)?,
            created_at: r.get(8)?,
            updated_at: r.get(9)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

#[tauri::command]
pub fn photo_project_save(
    state: tauri::State<'_, AppState>,
    input: SaveProjectInput,
) -> Result<PhotoProject, CommandError> {
    let id = uuid::Uuid::new_v4().to_string();
    let projects_root = PathBuf::from(&state.paths.projects);
    let folder = projects_root.join(&input.name);
    std::fs::create_dir_all(&folder)?;
    let project_path = folder.to_string_lossy().to_string();

    let conn = state.db.get()?;
    conn.execute(
        "INSERT INTO photo_projects
            (id, name, project_path, source_path, width, height, format, metadata_json)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![
            id,
            input.name,
            project_path,
            input.source_path,
            input.width,
            input.height,
            input.format,
            input.metadata_json,
        ],
    )?;

    let mut stmt = conn.prepare(
        "SELECT id, name, project_path, source_path, width, height, format,
                metadata_json, created_at, updated_at
         FROM photo_projects WHERE id=?1",
    )?;
    let project = stmt.query_row([&id], |r| {
        Ok(PhotoProject {
            id: r.get(0)?,
            name: r.get(1)?,
            project_path: r.get(2)?,
            source_path: r.get(3)?,
            width: r.get(4)?,
            height: r.get(5)?,
            format: r.get(6)?,
            metadata_json: r.get(7)?,
            created_at: r.get(8)?,
            updated_at: r.get(9)?,
        })
    })?;
    Ok(project)
}
