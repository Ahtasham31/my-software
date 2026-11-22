use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use uuid::Uuid;

use crate::error::{AppError, CommandError};
use crate::state::AppState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchFileResult {
    pub source: String,
    pub output: Option<String>,
    pub success: bool,
    pub error: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchResizeInput {
    pub sources: Vec<String>,
    pub output_dir: String,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub format: Option<String>,
}

#[tauri::command]
pub fn batch_resize(
    state: tauri::State<'_, AppState>,
    input: BatchResizeInput,
) -> Result<Vec<BatchFileResult>, CommandError> {
    let out_dir = PathBuf::from(&input.output_dir);
    std::fs::create_dir_all(&out_dir)?;

    let mut results: Vec<BatchFileResult> = Vec::new();
    let mut failed = 0;
    let total = input.sources.len();

    for src in &input.sources {
        match resize_one(
            src,
            &out_dir,
            input.width,
            input.height,
            input.format.as_deref(),
        ) {
            Ok(out) => results.push(BatchFileResult {
                source: src.clone(),
                output: Some(out),
                success: true,
                error: None,
            }),
            Err(e) => {
                failed += 1;
                results.push(BatchFileResult {
                    source: src.clone(),
                    output: None,
                    success: false,
                    error: Some(e.to_string()),
                });
            }
        }
    }

    let conn = state.db.get()?;
    let id = Uuid::new_v4().to_string();
    let err_report =
        serde_json::to_string(&results).map_err(|e| AppError::Internal(e.to_string()))?;
    conn.execute(
        "INSERT INTO batch_jobs (id, name, total, processed, failed, status, output_dir, error_report_json)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![
            id,
            "Resize batch",
            total as i64,
            (total - failed) as i64,
            failed as i64,
            "completed",
            input.output_dir,
            err_report,
        ],
    )?;

    Ok(results)
}

fn resize_one(
    src: &str,
    out_dir: &Path,
    width: Option<u32>,
    height: Option<u32>,
    format: Option<&str>,
) -> Result<String, AppError> {
    let img =
        image::open(src).map_err(|e| AppError::InvalidInput(format!("Decode failed: {}", e)))?;

    let (target_w, target_h) = match (width, height) {
        (Some(w), Some(h)) => (w, h),
        (Some(w), None) => {
            let ratio = w as f32 / img.width() as f32;
            (w, (img.height() as f32 * ratio) as u32)
        }
        (None, Some(h)) => {
            let ratio = h as f32 / img.height() as f32;
            ((img.width() as f32 * ratio) as u32, h)
        }
        (None, None) => (img.width(), img.height()),
    };

    let resized = img.resize_exact(target_w, target_h, image::imageops::FilterType::Lanczos3);

    let original_ext = std::path::Path::new(src)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("png")
        .to_lowercase();

    let out_format = format
        .map(|s| s.to_lowercase())
        .unwrap_or(original_ext.clone());
    let base_name = std::path::Path::new(src)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("output");

    let out_path = out_dir.join(format!("{}.{}", base_name, out_format));

    resized
        .save(&out_path)
        .map_err(|e| AppError::Internal(format!("Save failed: {}", e)))?;

    Ok(out_path.to_string_lossy().to_string())
}
