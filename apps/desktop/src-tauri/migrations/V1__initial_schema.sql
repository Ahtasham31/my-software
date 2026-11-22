-- ============================================================
-- DocuVerse Studio — Initial Schema (V1)
-- All timestamps are ISO-8601 UTC strings (TEXT).
-- All IDs are UUID v4 strings unless noted otherwise.
-- ============================================================

-- ---------- Application ----------
CREATE TABLE IF NOT EXISTS app_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_preferences (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS application_logs (
    id TEXT PRIMARY KEY,
    level TEXT NOT NULL,
    category TEXT,
    message TEXT NOT NULL,
    context TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------- Themes ----------
CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('light','dark')),
    builtin INTEGER NOT NULL DEFAULT 0,
    tokens_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS theme_preferences (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    theme_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('light','dark','system')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL
);

-- ---------- Modules ----------
CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    status TEXT NOT NULL,
    manifest_json TEXT,
    installed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS module_settings (
    module_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (module_id, key),
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS module_installation_state (
    module_id TEXT PRIMARY KEY,
    state TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- ---------- Projects ----------
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    module_id TEXT,
    root_path TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_files (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    path TEXT NOT NULL,
    role TEXT,
    size_bytes INTEGER,
    hash TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS project_tags (
    project_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (project_id, tag_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_favorites (
    project_id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ---------- Recent Activity ----------
CREATE TABLE IF NOT EXISTS recent_items (
    id TEXT PRIMARY KEY,
    item_type TEXT NOT NULL,
    path TEXT NOT NULL,
    label TEXT,
    module_id TEXT,
    last_opened_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_history (
    id TEXT PRIMARY KEY,
    event TEXT NOT NULL,
    detail_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------- Processing ----------
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    status TEXT NOT NULL,
    options_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    started_at TEXT,
    finished_at TEXT
);

CREATE TABLE IF NOT EXISTS job_history (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_errors (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    code TEXT,
    message TEXT NOT NULL,
    detail TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- ---------- Storage ----------
CREATE TABLE IF NOT EXISTS storage_locations (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    path TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS storage_metadata (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------- Backup ----------
CREATE TABLE IF NOT EXISTS backup_records (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    kind TEXT NOT NULL,
    path TEXT NOT NULL,
    manifest_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS backup_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled INTEGER NOT NULL DEFAULT 0,
    interval_hours INTEGER NOT NULL DEFAULT 24,
    location TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------- Licensing foundation (local storage only) ----------
CREATE TABLE IF NOT EXISTS license_cache (
    id TEXT PRIMARY KEY,
    license_blob TEXT NOT NULL,
    signature TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activation_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------- Indexes ----------
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_recent_items_opened ON recent_items(last_opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_application_logs_created ON application_logs(created_at DESC);