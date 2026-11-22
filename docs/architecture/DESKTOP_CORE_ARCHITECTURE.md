# Desktop Core Architecture

## Tauri 2 shell
- `main.rs` → `docuverse_studio_lib::run()`.
- Setup sequence: paths → storage dirs → logging → SQLite pool → migrations → state.
- Commands are the only bridge to native operations.

## Rust core modules
| Module | Responsibility |
|---|---|
| `db` | Connection pool, migrations, integrity |
| `storage` | OS-appropriate paths, safe filesystem ops |
| `settings` | Typed AppSettings load/save/reset |
| `logging` | File-based structured logging |
| `commands` | Thin typed Tauri command handlers |
| `state` | `AppState { db, paths }` managed by Tauri |

## Frontend boundary
- UI never calls filesystem or DB directly.
- All native calls go through `src/services/*` → `invokeNative`.
- `SettingsProvider` loads settings once and exposes typed updates.
- `ThemeProvider` applies tokens and persists appearance via settings.

## Lifecycle
- Startup: `StartupGate` calls `get_app_info`; on success renders app.
- Settings load → ThemeProvider applies persisted theme.
- Shutdown: Tauri handles window close; no background services spawned in Phase 03.