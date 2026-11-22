mod commands;
mod db;
mod error;
mod logging;
mod settings;
mod state;
mod storage;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let paths = storage::paths::resolve_paths(app.handle())?;
            storage::paths::ensure_dirs(&paths)?;

            let _log_guard = logging::init(std::path::Path::new(&paths.logs));
            std::mem::forget(_log_guard);

            let db_path = std::path::Path::new(&paths.database).join("docuverse.db");
            let pool = db::create_pool(&db_path)?;

            {
                let mut conn = pool.get()?;
                db::migrations::run_migrations(&mut conn)?;
            }

            app.manage(state::AppState { db: pool, paths });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::app::get_app_info,
            commands::settings::settings_get,
            commands::settings::settings_set,
            commands::settings::settings_reset,
            commands::storage::storage_paths,
            commands::fs::fs_metadata,
            commands::fs::fs_safe_write,
            commands::logging::log_frontend,
            commands::projects::projects_list,
            commands::projects::project_create,
            commands::projects::project_rename,
            commands::projects::project_delete,
            commands::projects::project_duplicate,
            commands::files::fs_browse,
            commands::files::fs_create_folder,
            commands::files::fs_import_file,
            commands::files::fs_rename_path,
            commands::files::fs_delete_path,
            commands::files::fs_reveal_in_os,
            commands::data::recent_track,
            commands::data::recent_list,
            commands::data::recent_clear,
            commands::data::activity_list,
            commands::search::global_search,
            commands::dashboard::dashboard_summary,
            commands::dialog::open_file_dialog,
            commands::dialog::open_dir_dialog,
            commands::dialog::save_file_dialog,
            commands::photo::photo_load_image,
            commands::photo::photo_save_image,
            commands::photo::photo_projects_list,
            commands::photo::photo_project_save,
            commands::favorites::favorites_list,
            commands::favorites::favorites_add,
            commands::favorites::favorites_remove,
            commands::favorites::favorites_is,
            commands::dashboard_prefs::dashboard_prefs_get,
            commands::dashboard_prefs::dashboard_prefs_set,
            commands::batch::batch_resize,
            commands::passport::passport_presets_list,
            commands::passport::passport_preset_save,
            commands::passport::passport_preset_delete,
            commands::passport::passport_project_save,
            commands::passport::passport_projects_list,
            commands::passport::passport_save_data_url,
            commands::passport::passport_backgrounds_list,
            commands::passport::passport_background_save,
            commands::passport::passport_background_delete,
            commands::ocr::ocr_check_engine,
            commands::ocr::ocr_list_languages,
            commands::ocr::ocr_preprocess_preview,
            commands::ocr::ocr_recognize_image,
            commands::ocr::ocr_extract_pdf_text,
            commands::ocr::ocr_render_pdf_page,
            commands::ocr::ocr_save_text,
            commands::ocr::ocr_save_docx,
            commands::ocr::ocr_job_save,
            commands::ocr::ocr_jobs_list,
            commands::ocr::ocr_job_delete,
            commands::ocr::ocr_jobs_clear,
            commands::ocr::ocr_recognize_image_tsv,
            commands::ocr::ocr_recognize_pdf_page,
            commands::ocr::ocr_create_searchable_pdf,
            commands::ocr::ocr_pdf_to_docx,
            commands::ocr::ocr_language_pack_status,
            commands::ocr::ocr_install_language_pack,
            commands::ocr::ocr_language_pack_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running DocuVerse Studio");
}
