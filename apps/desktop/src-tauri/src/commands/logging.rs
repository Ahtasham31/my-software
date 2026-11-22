#[tauri::command]
pub fn log_frontend(level: String, message: String, context: Option<String>) {
    match level.as_str() {
        "error" => tracing::error!(context = ?context, "{message}"),
        "warn" => tracing::warn!(context = ?context, "{message}"),
        "debug" => tracing::debug!(context = ?context, "{message}"),
        _ => tracing::info!(context = ?context, "{message}"),
    }
}
