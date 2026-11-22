use serde::Serialize;

use crate::error::CommandError;
use crate::state::AppState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardSummary {
    pub project_count: i64,
    pub recent_file_count: i64,
    pub activity_count: i64,
    pub storage: StorageUsage,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageUsage {
    pub root: String,
    pub projects_bytes: u64,
    pub documents_bytes: u64,
    pub images_bytes: u64,
    pub exports_bytes: u64,
    pub backups_bytes: u64,
}

#[tauri::command]
pub fn dashboard_summary(
    state: tauri::State<'_, AppState>,
) -> Result<DashboardSummary, CommandError> {
    let conn = state.db.get()?;
    let project_count: i64 = conn.query_row("SELECT COUNT(*) FROM projects", [], |r| r.get(0))?;
    let recent_file_count: i64 =
        conn.query_row("SELECT COUNT(*) FROM recent_items", [], |r| r.get(0))?;
    let activity_count: i64 =
        conn.query_row("SELECT COUNT(*) FROM activity_history", [], |r| r.get(0))?;

    let storage = StorageUsage {
        root: state.paths.root.clone(),
        projects_bytes: dir_size(&state.paths.projects),
        documents_bytes: dir_size(&state.paths.documents),
        images_bytes: dir_size(&state.paths.images),
        exports_bytes: dir_size(&state.paths.exports),
        backups_bytes: dir_size(&state.paths.backups),
    };

    Ok(DashboardSummary {
        project_count,
        recent_file_count,
        activity_count,
        storage,
    })
}

fn dir_size(path: &str) -> u64 {
    walkdir::WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter_map(|e| e.metadata().ok())
        .filter(|m| m.is_file())
        .map(|m| m.len())
        .sum()
}
