use tauri_plugin_dialog::DialogExt;

#[tauri::command]
pub async fn open_file_dialog(
    app: tauri::AppHandle,
    _multiple: Option<bool>,
) -> Result<Vec<String>, String> {
    let files =
        tauri::async_runtime::spawn_blocking(move || app.dialog().file().blocking_pick_files())
            .await
            .map_err(|e| e.to_string())?;

    Ok(files
        .unwrap_or_default()
        .into_iter()
        .filter_map(|p| {
            p.into_path()
                .ok()
                .map(|pb| pb.to_string_lossy().to_string())
        })
        .collect())
}

#[tauri::command]
pub async fn open_dir_dialog(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let folder =
        tauri::async_runtime::spawn_blocking(move || app.dialog().file().blocking_pick_folder())
            .await
            .map_err(|e| e.to_string())?;

    Ok(folder
        .and_then(|p| p.into_path().ok())
        .map(|pb| pb.to_string_lossy().to_string()))
}

#[tauri::command]
pub async fn save_file_dialog(
    app: tauri::AppHandle,
    default_name: Option<String>,
    filters: Option<Vec<Vec<String>>>,
) -> Result<Option<String>, String> {
    let result = tauri::async_runtime::spawn_blocking(move || {
        let mut dialog = app.dialog().file();
        if let Some(name) = default_name {
            dialog = dialog.set_file_name(name);
        }
        if let Some(filter_list) = filters {
            for filter in filter_list {
                if filter.len() >= 2 {
                    let name = filter[0].clone();
                    let exts: Vec<&str> = filter[1..].iter().map(|s| s.as_str()).collect();
                    dialog = dialog.add_filter(name, &exts);
                }
            }
        }
        dialog.blocking_save_file()
    })
    .await
    .map_err(|e| e.to_string())?;

    Ok(result
        .and_then(|p| p.into_path().ok())
        .map(|pb| pb.to_string_lossy().to_string()))
}
