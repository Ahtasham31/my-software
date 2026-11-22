# Database Schema (V1)

All IDs are UUID v4 TEXT. All timestamps are ISO-8601 UTC TEXT.

## Core tables
- `app_metadata(key PK, value, updated_at)`
- `app_settings(key PK, value_json, updated_at)`
- `user_preferences(key PK, value_json, updated_at)`
- `application_logs(id PK, level, category, message, context, created_at)`

## Themes
- `themes(id PK, name, mode, builtin, tokens_json, created_at)`
- `theme_preferences(id=1, theme_id FK→themes, mode, updated_at)`

## Modules
- `modules(id PK, name, version, status, manifest_json, installed_at)`
- `module_settings(module_id PK1, key PK2, value_json, updated_at)`
- `module_installation_state(module_id PK, state, updated_at)`

## Projects
- `projects(id PK, name, module_id, root_path, created_at, updated_at)`
- `project_files(id PK, project_id FK→projects ON DELETE CASCADE, path, role, size_bytes, hash, created_at)`
- `tags(id PK, label UNIQUE)`
- `project_tags(project_id, tag_id, PK both)`
- `project_favorites(project_id PK)`

## Activity
- `recent_items(id PK, item_type, path, label, module_id, last_opened_at)`
- `activity_history(id PK, event, detail_json, created_at)`

## Jobs
- `jobs(id PK, module_id, kind, status, options_json, created_at, started_at, finished_at)`
- `job_history(id PK, job_id FK ON DELETE CASCADE, status, message, created_at)`
- `job_errors(id PK, job_id FK ON DELETE CASCADE, code, message, detail, created_at)`

## Storage
- `storage_locations(id PK, kind, path, is_default, created_at)`
- `storage_metadata(key PK, value_json, updated_at)`

## Backup
- `backup_records(id PK, label, kind, path, manifest_json, created_at)`
- `backup_settings(id=1, enabled, interval_hours, location, updated_at)`

## Licensing foundation (storage only)
- `license_cache(id PK, license_blob, signature, updated_at)`
- `activation_metadata(key PK, value, updated_at)`

## Indexes
See `V1__initial_schema.sql`. All list queries used by UI must be index-backed.