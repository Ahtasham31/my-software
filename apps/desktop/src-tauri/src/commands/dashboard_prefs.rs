use serde::{Deserialize, Serialize};

use crate::error::CommandError;
use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardPrefs {
    pub hidden_widgets: Vec<String>,
    pub widget_order: Vec<String>,
}

impl Default for DashboardPrefs {
    fn default() -> Self {
        Self {
            hidden_widgets: Vec::new(),
            widget_order: vec![
                "welcome".into(),
                "quickActions".into(),
                "recentProjects".into(),
                "recentFiles".into(),
                "storage".into(),
                "activity".into(),
                "systemInfo".into(),
            ],
        }
    }
}

#[tauri::command]
pub fn dashboard_prefs_get(
    state: tauri::State<'_, AppState>,
) -> Result<DashboardPrefs, CommandError> {
    let conn = state.db.get()?;
    let mut stmt = conn.prepare("SELECT prefs_json FROM dashboard_preferences WHERE id=1")?;
    let mut rows = stmt.query([])?;
    if let Some(row) = rows.next()? {
        let json: String = row.get(0)?;
        let prefs: DashboardPrefs = serde_json::from_str(&json).unwrap_or_default();
        Ok(prefs)
    } else {
        Ok(DashboardPrefs::default())
    }
}

#[tauri::command]
pub fn dashboard_prefs_set(
    state: tauri::State<'_, AppState>,
    prefs: DashboardPrefs,
) -> Result<(), CommandError> {
    let conn = state.db.get()?;
    let json = serde_json::to_string(&prefs)
        .map_err(|e| crate::error::AppError::Internal(e.to_string()))?;
    conn.execute(
        "INSERT INTO dashboard_preferences (id, prefs_json, updated_at)
         VALUES (1, ?1, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET prefs_json = excluded.prefs_json,
                                       updated_at = excluded.updated_at",
        [&json],
    )?;
    Ok(())
}
