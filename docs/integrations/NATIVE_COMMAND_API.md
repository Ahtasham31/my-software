# Native Command API (Phase 03)

| Command | Request | Response | Notes |
|---|---|---|---|
| `get_app_info` | — | `{ name, version, platform, arch, storage }` | Storage paths are OS-resolved |
| `settings_get` | — | `AppSettings` | Defaults if row missing |
| `settings_set` | `{ settings }` | `()` | Validates via serde |
| `settings_reset` | — | `AppSettings` | Persists defaults |
| `storage_paths` | — | `StoragePaths` | Read-only view |
| `fs_metadata` | `{ path }` | `{ size, isDir, modified }` | Read-only |
| `fs_safe_write` | `{ path, data }` | `()` | Path must stay inside root |
| `log_frontend` | `{ level, message, context? }` | `()` | Writes via `tracing` |

All errors are `CommandError { category, message, detail? }`.