use crate::error::CommandError;
use crate::settings::{model::AppSettings, service};
use crate::state::AppState;

#[tauri::command]
pub fn settings_get(state: tauri::State<'_, AppState>) -> Result<AppSettings, CommandError> {
    Ok(service::load(&state.db)?)
}

#[tauri::command]
pub fn settings_set(
    state: tauri::State<'_, AppState>,
    settings: AppSettings,
) -> Result<(), CommandError> {
    service::save(&state.db, &settings)?;
    Ok(())
}

#[tauri::command]
pub fn settings_reset(state: tauri::State<'_, AppState>) -> Result<AppSettings, CommandError> {
    Ok(service::reset(&state.db)?)
}
