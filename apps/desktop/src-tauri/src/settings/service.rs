use crate::db::DbPool;
use crate::error::AppError;

use super::model::AppSettings;

const SETTINGS_KEY: &str = "app";

pub fn load(pool: &DbPool) -> Result<AppSettings, AppError> {
    let conn = pool.get()?;
    let mut stmt = conn.prepare("SELECT value_json FROM app_settings WHERE key = ?1")?;
    let mut rows = stmt.query([SETTINGS_KEY])?;

    if let Some(row) = rows.next()? {
        let json: String = row.get(0)?;
        let settings: AppSettings = serde_json::from_str(&json)
            .map_err(|e| AppError::Internal(format!("Invalid settings JSON: {e}")))?;
        Ok(settings)
    } else {
        Ok(AppSettings::default())
    }
}

pub fn save(pool: &DbPool, settings: &AppSettings) -> Result<(), AppError> {
    let conn = pool.get()?;
    let json = serde_json::to_string(settings).map_err(|e| AppError::Internal(e.to_string()))?;

    conn.execute(
        "INSERT INTO app_settings (key, value_json, updated_at)
         VALUES (?1, ?2, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET
            value_json = excluded.value_json,
            updated_at = excluded.updated_at",
        rusqlite::params![SETTINGS_KEY, json],
    )?;

    Ok(())
}

pub fn reset(pool: &DbPool) -> Result<AppSettings, AppError> {
    let defaults = AppSettings::default();
    save(pool, &defaults)?;
    Ok(defaults)
}
