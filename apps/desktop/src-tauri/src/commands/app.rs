use serde::Serialize;

use crate::state::AppState;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub platform: String,
    pub arch: String,
    pub storage: crate::storage::paths::StoragePaths,
}

#[tauri::command]
pub fn get_app_info(
    state: tauri::State<'_, AppState>,
) -> Result<AppInfo, crate::error::CommandError> {
    Ok(AppInfo {
        name: "DocuVerse Studio".into(),
        version: env!("CARGO_PKG_VERSION").into(),
        platform: std::env::consts::OS.into(),
        arch: std::env::consts::ARCH.into(),
        storage: state.paths.clone(),
    })
}
