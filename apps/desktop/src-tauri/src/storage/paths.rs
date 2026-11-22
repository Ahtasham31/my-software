use tauri::Manager;

use crate::error::AppError;

#[derive(Debug, Clone, serde::Serialize)]
pub struct StoragePaths {
    pub root: String,
    pub database: String,
    pub projects: String,
    pub documents: String,
    pub images: String,
    pub thumbnails: String,
    pub templates: String,
    pub exports: String,
    pub backups: String,
    pub cache: String,
    pub temporary: String,
    pub logs: String,
    pub settings: String,
}

pub fn resolve_paths(app: &tauri::AppHandle) -> Result<StoragePaths, AppError> {
    let base = app
        .path()
        .app_data_dir()
        .map_err(|e| AppError::Internal(e.to_string()))?;
    let root = base.join("DocuVerseStudio");
    let p = |sub: &str| root.join(sub).to_string_lossy().into_owned();

    Ok(StoragePaths {
        root: root.to_string_lossy().into_owned(),
        database: p("database"),
        projects: p("projects"),
        documents: p("documents"),
        images: p("images"),
        thumbnails: p("thumbnails"),
        templates: p("templates"),
        exports: p("exports"),
        backups: p("backups"),
        cache: p("cache"),
        temporary: p("temporary"),
        logs: p("logs"),
        settings: p("settings"),
    })
}

pub fn ensure_dirs(paths: &StoragePaths) -> Result<(), AppError> {
    for dir in [
        &paths.database,
        &paths.projects,
        &paths.documents,
        &paths.images,
        &paths.thumbnails,
        &paths.templates,
        &paths.exports,
        &paths.backups,
        &paths.cache,
        &paths.temporary,
        &paths.logs,
        &paths.settings,
    ] {
        std::fs::create_dir_all(dir)?;
    }
    Ok(())
}
