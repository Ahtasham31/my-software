# Application Startup Sequence

1. Tauri resolves app data directory.
2. `storage/paths.rs` builds `DocuVerseStudio/` layout and creates all subdirectories.
3. `logging::init` starts daily rotating file log.
4. SQLite pool created with WAL, foreign_keys=ON, busy_timeout.
5. `refinery` runs pending migrations inside a transaction.
6. `AppState { db, paths }` is registered.
7. Tauri commands become available.
8. Frontend `StartupGate` calls `get_app_info`; on success renders routes.
9. `SettingsProvider` loads `app_settings` row and `ThemeProvider` applies tokens.

Failure handling:
- Any setup error aborts `setup`; Tauri does not show the window.
- Frontend startup error shows retry UI; no database reset is performed.