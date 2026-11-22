use base64::{engine::general_purpose::STANDARD, Engine as _};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use uuid::Uuid;

use crate::error::{AppError, CommandError};
use crate::state::AppState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PassportPreset {
    pub id: String,
    pub name: String,
    pub category: String,
    pub width_mm: f64,
    pub height_mm: f64,
    pub dpi: i64,
    pub aspect_ratio: Option<String>,
    pub background_preference: Option<String>,
    pub custom: bool,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavePresetInput {
    pub name: String,
    pub category: String,
    pub width_mm: f64,
    pub height_mm: f64,
    pub dpi: i64,
    pub aspect_ratio: Option<String>,
    pub background_preference: Option<String>,
}

#[tauri::command]
pub fn passport_presets_list(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<PassportPreset>, CommandError> {
    let conn = state.db.get()?;
    let mut stmt = conn.prepare(
        "SELECT id, name, category, width_mm, height_mm, dpi, aspect_ratio,
                background_preference, custom, created_at
         FROM passport_presets ORDER BY custom ASC, name ASC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(PassportPreset {
            id: r.get(0)?,
            name: r.get(1)?,
            category: r.get(2)?,
            width_mm: r.get(3)?,
            height_mm: r.get(4)?,
            dpi: r.get(5)?,
            aspect_ratio: r.get(6)?,
            background_preference: r.get(7)?,
            custom: r.get::<_, i64>(8)? != 0,
            created_at: r.get(9)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

#[tauri::command]
pub fn passport_preset_save(
    state: tauri::State<'_, AppState>,
    input: SavePresetInput,
) -> Result<PassportPreset, CommandError> {
    let id = Uuid::new_v4().to_string();
    let conn = state.db.get()?;
    conn.execute(
        "INSERT INTO passport_presets
            (id, name, category, width_mm, height_mm, dpi, aspect_ratio,
             background_preference, custom)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 1)",
        rusqlite::params![
            id,
            input.name,
            input.category,
            input.width_mm,
            input.height_mm,
            input.dpi,
            input.aspect_ratio,
            input.background_preference,
        ],
    )?;
    let preset = conn.query_row(
        "SELECT id, name, category, width_mm, height_mm, dpi, aspect_ratio,
                background_preference, custom, created_at
         FROM passport_presets WHERE id=?1",
        [&id],
        |r| {
            Ok(PassportPreset {
                id: r.get(0)?,
                name: r.get(1)?,
                category: r.get(2)?,
                width_mm: r.get(3)?,
                height_mm: r.get(4)?,
                dpi: r.get(5)?,
                aspect_ratio: r.get(6)?,
                background_preference: r.get(7)?,
                custom: r.get::<_, i64>(8)? != 0,
                created_at: r.get(9)?,
            })
        },
    )?;
    Ok(preset)
}

#[tauri::command]
pub fn passport_preset_delete(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<(), CommandError> {
    let conn = state.db.get()?;
    conn.execute(
        "DELETE FROM passport_presets WHERE id=?1 AND custom=1",
        [&id],
    )?;
    Ok(())
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveProjectInput {
    pub name: String,
    pub source_path: Option<String>,
    pub preset_id: Option<String>,
    pub settings_json: Option<String>,
    pub output_path: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PassportProject {
    pub id: String,
    pub name: String,
    pub source_path: Option<String>,
    pub preset_id: Option<String>,
    pub settings_json: Option<String>,
    pub output_path: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[tauri::command]
pub fn passport_project_save(
    state: tauri::State<'_, AppState>,
    input: SaveProjectInput,
) -> Result<PassportProject, CommandError> {
    let id = Uuid::new_v4().to_string();
    let conn = state.db.get()?;
    conn.execute(
        "INSERT INTO passport_projects
            (id, name, source_path, preset_id, settings_json, output_path)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![
            id,
            input.name,
            input.source_path,
            input.preset_id,
            input.settings_json,
            input.output_path,
        ],
    )?;
    let project = conn.query_row(
        "SELECT id, name, source_path, preset_id, settings_json, output_path,
                created_at, updated_at
         FROM passport_projects WHERE id=?1",
        [&id],
        |r| {
            Ok(PassportProject {
                id: r.get(0)?,
                name: r.get(1)?,
                source_path: r.get(2)?,
                preset_id: r.get(3)?,
                settings_json: r.get(4)?,
                output_path: r.get(5)?,
                created_at: r.get(6)?,
                updated_at: r.get(7)?,
            })
        },
    )?;
    Ok(project)
}

#[tauri::command]
pub fn passport_projects_list(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<PassportProject>, CommandError> {
    let conn = state.db.get()?;
    let mut stmt = conn.prepare(
        "SELECT id, name, source_path, preset_id, settings_json, output_path,
                created_at, updated_at
         FROM passport_projects ORDER BY updated_at DESC LIMIT 50",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(PassportProject {
            id: r.get(0)?,
            name: r.get(1)?,
            source_path: r.get(2)?,
            preset_id: r.get(3)?,
            settings_json: r.get(4)?,
            output_path: r.get(5)?,
            created_at: r.get(6)?,
            updated_at: r.get(7)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveDataUrlInput {
    pub path: String,
    pub data_url: String,
}

#[tauri::command]
pub fn passport_save_data_url(input: SaveDataUrlInput) -> Result<String, CommandError> {
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
pub struct CustomBackground {
    pub id: String,
    pub name: String,
    pub kind: String,
    pub color1: String,
    pub color2: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveBackgroundInput {
    pub name: String,
    pub kind: String,
    pub color1: String,
    pub color2: Option<String>,
}

#[tauri::command]
pub fn passport_backgrounds_list(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<CustomBackground>, CommandError> {
    let conn = state.db.get()?;
    let mut stmt = conn.prepare(
        "SELECT id, name, kind, color1, color2, created_at
         FROM passport_backgrounds ORDER BY created_at DESC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(CustomBackground {
            id: r.get(0)?,
            name: r.get(1)?,
            kind: r.get(2)?,
            color1: r.get(3)?,
            color2: r.get(4)?,
            created_at: r.get(5)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

#[tauri::command]
pub fn passport_background_save(
    state: tauri::State<'_, AppState>,
    input: SaveBackgroundInput,
) -> Result<CustomBackground, CommandError> {
    let id = Uuid::new_v4().to_string();
    let conn = state.db.get()?;
    conn.execute(
        "INSERT INTO passport_backgrounds (id, name, kind, color1, color2)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![id, input.name, input.kind, input.color1, input.color2],
    )?;
    let bg = conn.query_row(
        "SELECT id, name, kind, color1, color2, created_at
         FROM passport_backgrounds WHERE id=?1",
        [&id],
        |r| {
            Ok(CustomBackground {
                id: r.get(0)?,
                name: r.get(1)?,
                kind: r.get(2)?,
                color1: r.get(3)?,
                color2: r.get(4)?,
                created_at: r.get(5)?,
            })
        },
    )?;
    Ok(bg)
}

#[tauri::command]
pub fn passport_background_delete(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<(), CommandError> {
    let conn = state.db.get()?;
    conn.execute("DELETE FROM passport_backgrounds WHERE id=?1", [&id])?;
    Ok(())
}
