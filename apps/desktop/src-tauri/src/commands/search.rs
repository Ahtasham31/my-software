use serde::Serialize;

use crate::error::CommandError;
use crate::state::AppState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchHit {
    pub kind: String,
    pub id: String,
    pub label: String,
    pub path: Option<String>,
}

#[tauri::command]
pub fn global_search(
    state: tauri::State<'_, AppState>,
    query: String,
    limit: Option<i64>,
) -> Result<Vec<SearchHit>, CommandError> {
    let conn = state.db.get()?;
    let lim = limit.unwrap_or(30);
    let pattern = format!("%{}%", query.replace('%', "\\%").replace('_', "\\_"));

    let mut hits: Vec<SearchHit> = Vec::new();

    // Projects
    let mut stmt = conn.prepare(
        "SELECT id, name, root_path FROM projects WHERE name LIKE ?1 ESCAPE '\\'
         ORDER BY updated_at DESC LIMIT ?2",
    )?;
    let rows = stmt.query_map(rusqlite::params![pattern, lim], |r| {
        Ok(SearchHit {
            kind: "project".into(),
            id: r.get(0)?,
            label: r.get(1)?,
            path: Some(r.get(2)?),
        })
    })?;
    for r in rows {
        hits.push(r?);
    }

    // Recent items
    let mut stmt = conn.prepare(
        "SELECT id, item_type, COALESCE(label, path), path FROM recent_items
         WHERE path LIKE ?1 ESCAPE '\\' OR label LIKE ?1 ESCAPE '\\'
         ORDER BY last_opened_at DESC LIMIT ?2",
    )?;
    let rows = stmt.query_map(rusqlite::params![pattern, lim], |r| {
        Ok(SearchHit {
            kind: r.get::<_, String>(1)?,
            id: r.get(0)?,
            label: r.get(2)?,
            path: Some(r.get(3)?),
        })
    })?;
    for r in rows {
        hits.push(r?);
    }

    Ok(hits)
}
