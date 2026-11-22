use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::CommandError;
use crate::state::AppState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Favorite {
    pub id: String,
    pub item_type: String,
    pub item_id: String,
    pub label: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddFavoriteInput {
    pub item_type: String,
    pub item_id: String,
    pub label: Option<String>,
}

#[tauri::command]
pub fn favorites_list(state: tauri::State<'_, AppState>) -> Result<Vec<Favorite>, CommandError> {
    let conn = state.db.get()?;
    let mut stmt = conn.prepare(
        "SELECT id, item_type, item_id, label, created_at FROM favorites
         ORDER BY created_at DESC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(Favorite {
            id: r.get(0)?,
            item_type: r.get(1)?,
            item_id: r.get(2)?,
            label: r.get(3)?,
            created_at: r.get(4)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

#[tauri::command]
pub fn favorites_add(
    state: tauri::State<'_, AppState>,
    input: AddFavoriteInput,
) -> Result<(), CommandError> {
    let conn = state.db.get()?;
    conn.execute(
        "INSERT INTO favorites (id, item_type, item_id, label)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(item_type, item_id) DO UPDATE SET label = excluded.label",
        rusqlite::params![
            Uuid::new_v4().to_string(),
            input.item_type,
            input.item_id,
            input.label,
        ],
    )?;
    Ok(())
}

#[tauri::command]
pub fn favorites_remove(
    state: tauri::State<'_, AppState>,
    item_type: String,
    item_id: String,
) -> Result<(), CommandError> {
    let conn = state.db.get()?;
    conn.execute(
        "DELETE FROM favorites WHERE item_type=?1 AND item_id=?2",
        rusqlite::params![item_type, item_id],
    )?;
    Ok(())
}

#[tauri::command]
pub fn favorites_is(
    state: tauri::State<'_, AppState>,
    item_type: String,
    item_id: String,
) -> Result<bool, CommandError> {
    let conn = state.db.get()?;
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM favorites WHERE item_type=?1 AND item_id=?2",
        rusqlite::params![item_type, item_id],
        |r| r.get(0),
    )?;
    Ok(count > 0)
}
