use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("Pool error: {0}")]
    Pool(#[from] r2d2::Error),
    #[error("Migration error: {0}")]
    Migration(#[from] refinery::Error),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Path validation failed: {0}")]
    PathValidation(String),
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    #[error("Internal error: {0}")]
    Internal(String),
}

#[derive(Debug, Serialize)]
pub struct CommandError {
    pub category: String,
    pub message: String,
    pub detail: Option<String>,
}

impl From<AppError> for CommandError {
    fn from(e: AppError) -> Self {
        let category = match &e {
            AppError::Database(_) | AppError::Pool(_) => "database",
            AppError::Migration(_) => "migration",
            AppError::Io(_) => "storage",
            AppError::PathValidation(_) => "storage",
            AppError::NotFound(_) => "not_found",
            AppError::InvalidInput(_) => "validation",
            AppError::PermissionDenied(_) => "permission",
            AppError::Internal(_) => "internal",
        };
        CommandError {
            category: category.into(),
            message: e.to_string(),
            detail: None,
        }
    }
}

// ---- Individual From impls so `?` works in #[tauri::command] fns ----
// These convert via AppError, which already classifies the error.

impl From<rusqlite::Error> for CommandError {
    fn from(e: rusqlite::Error) -> Self {
        AppError::Database(e).into()
    }
}

impl From<r2d2::Error> for CommandError {
    fn from(e: r2d2::Error) -> Self {
        AppError::Pool(e).into()
    }
}

impl From<std::io::Error> for CommandError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e).into()
    }
}
