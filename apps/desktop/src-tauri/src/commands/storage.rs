use crate::error::CommandError;
use crate::state::AppState;
use crate::storage::paths::StoragePaths;

#[tauri::command]
pub fn storage_paths(state: tauri::State<'_, AppState>) -> Result<StoragePaths, CommandError> {
    Ok(state.paths.clone())
}
