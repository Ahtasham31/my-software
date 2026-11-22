use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::CommandError;
use crate::state::AppState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentItem {
    pub id: String,
    pub item_type: String,
    pub path: String,
    pub label: Option<String>,
    pub module_id: Option<String>,
    pub last_opened_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackRecentInput {
    pub item_type: String,
    pub path: String,
    pub label: Option<String>,
    pub module_id: Option<String>,
}

#[tauri::command]
pub fn recent_track(
    state: tauri::State<'_, AppState>,
    input: TrackRecentInput,
) -> Result<(), CommandError> {
    let conn = state.db.get()?;
    conn.execute("DELETE FROM recent_items WHERE path=?1", [&input.path])?;
    conn.execute(
        "INSERT INTO recent_items (id, item_type, path, label, module_id)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![
            Uuid::new_v4().to_string(),
            input.item_type,
            input.path,
            input.label,
            input.module_id
        ],
    )?;
    conn.execute(
        "DELETE FROM recent_items WHERE id NOT IN (
            SELECT id FROM recent_items ORDER BY last_opened_at DESC LIMIT 100
         )",
        [],
    )?;
    Ok(())
}

#[tauri::command]
pub fn recent_list(
    state: tauri::State<'_, AppState>,
    limit: Option<i64>,
) -> Result<Vec<RecentItem>, CommandError> {
    let conn = state.db.get()?;
    let lim = limit.unwrap_or(20);
    let mut stmt = conn.prepare(
        "SELECT id, item_type, path, label, module_id, last_opened_at
         FROM recent_items ORDER BY last_opened_at DESC LIMIT ?1",
    )?;
    let rows = stmt.query_map([lim], |r| {
        Ok(RecentItem {
            id: r.get(0)?,
            item_type: r.get(1)?,
            path: r.get(2)?,
            label: r.get(3)?,
            module_id: r.get(4)?,
            last_opened_at: r.get(5)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

#[tauri::command]
pub fn recent_clear(state: tauri::State<'_, AppState>) -> Result<(), CommandError> {
    let conn = state.db.get()?;
    conn.execute("DELETE FROM recent_items", [])?;
    Ok(())
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityEntry {
    pub id: String,
    pub event: String,
    pub detail: Option<String>,
    pub created_at: String,
}

#[tauri::command]
pub fn activity_list(
    state: tauri::State<'_, AppState>,
    limit: Option<i64>,
) -> Result<Vec<ActivityEntry>, CommandError> {
    let conn = state.db.get()?;
    let lim = limit.unwrap_or(30);
    let mut stmt = conn.prepare(
        "SELECT id, event, detail_json, created_at FROM activity_history
         ORDER BY created_at DESC LIMIT ?1",
    )?;
    let rows = stmt.query_map([lim], |r| {
        Ok(ActivityEntry {
            id: r.get(0)?,
            event: r.get(1)?,
            detail: r.get(2)?,
            created_at: r.get(3)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}
