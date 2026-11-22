# DATABASE ARCHITECTURE — DocuVerse Studio

## 1. Engine
SQLite, WAL mode, foreign keys ON, migrations versioned.

## 2. Conventions
- `id` UUID/TEXT primary keys.
- Timestamps ISO-8601 UTC.
- Soft references where integrity is optional.
- Migration files `NNNN_<name>.sql` with up/down (down where safe).
- Every schema change requires a migration and test.

## 3. Core Tables

### Settings & Themes
- `app_settings(key TEXT PK, value_json TEXT, updated_at)`
- `settings_schemas(module_id TEXT, key TEXT, schema_json, PRIMARY KEY(module_id,key))`
- `themes(id TEXT PK, name TEXT, token_json TEXT, builtin INTEGER, created_at)`
- `workspace_layouts(id TEXT PK, name TEXT, layout_json TEXT, created_at)`

### Projects & Files
- `projects(id TEXT PK, name TEXT, module_id TEXT, path TEXT, created_at, updated_at)`
- `project_files(project_id, path, role, size_bytes, hash, PRIMARY KEY(project_id,path))`
- `recent_files(id TEXT PK, path TEXT UNIQUE, module_id TEXT, last_opened_at)`
- `favorites(id TEXT PK, path TEXT UNIQUE, label TEXT, created_at)`
- `tags(id TEXT PK, label TEXT UNIQUE)`
- `file_tags(path TEXT, tag_id TEXT, PRIMARY KEY(path,tag_id))`

### Jobs
- `jobs(id TEXT PK, module_id TEXT, kind TEXT, status TEXT, created_at,
        started_at, finished_at, priority INTEGER, cancel_requested INTEGER,
        error_code TEXT, error_message TEXT, options_json TEXT)`
- `job_items(job_id TEXT, idx INTEGER, status TEXT, progress REAL,
        message TEXT, PRIMARY KEY(job_id,idx))`
- `job_outputs(job_id TEXT, path TEXT, mime TEXT, role TEXT)`

### Backups
- `backups(id TEXT PK, label TEXT, kind TEXT, created_at, path TEXT, manifest_json TEXT)`
- `backup_versions(id TEXT PK, backup_id TEXT, version INTEGER, created_at,
        hashes_json TEXT, size_bytes INTEGER)`
- `crash_recovery(id TEXT PK, module_id TEXT, project_path TEXT,
        snapshot_path TEXT, created_at)`

### Licensing
- `licenses(id TEXT PK, plan TEXT, duration TEXT, status TEXT,
        device_id TEXT, issued_at, expires_at, license_blob TEXT, signature TEXT)`
- `license_events(id TEXT PK, license_id TEXT, event TEXT, at, detail_json TEXT)`
- `devices(device_id TEXT PK, label TEXT, first_seen_at, last_seen_at)`

### Profiles
- `scanner_profiles(id TEXT PK, name TEXT, driver TEXT, options_json TEXT)`
- `printer_profiles(id TEXT PK, name TEXT, driver TEXT, options_json TEXT)`
- `export_presets(id TEXT PK, module_id TEXT, name TEXT, options_json TEXT)`

### Modules & Diagnostics
- `modules(id TEXT PK, name TEXT, version TEXT, status TEXT,
        manifest_json TEXT, installed_at, signature TEXT)`
- `module_versions(module_id TEXT, version TEXT, installed_at, notes TEXT)`
- `audit_events(id TEXT PK, at, actor TEXT, event TEXT, detail_json TEXT)`
- `help_index(id TEXT PK, title TEXT, body TEXT, module_id TEXT, keywords TEXT)`

## 4. Indexes
- `recent_files(last_opened_at DESC)`
- `jobs(status, created_at)`
- `job_items(job_id, idx)`
- `projects(module_id)`, `projects(updated_at DESC)`
- `licenses(status)`, `license_events(license_id)`
- `modules(status)`

## 5. Transactions & Safety
- All multi-write operations wrapped in transactions.
- Migrations transactional.
- Backup verification uses stored hashes.
- No `DELETE CASCADE` from any table referencing user documents.
- User-document deletion is only via explicit UI action with confirmation.

## 6. Backup of the DB itself
- Periodic SQLite backup via online backup API.
- WAL checkpoint before backup where safe.
- Integrity check after backup.