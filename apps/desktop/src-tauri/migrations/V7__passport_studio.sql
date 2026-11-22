CREATE TABLE IF NOT EXISTS passport_presets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    width_mm REAL NOT NULL,
    height_mm REAL NOT NULL,
    dpi INTEGER NOT NULL DEFAULT 300,
    aspect_ratio TEXT,
    background_preference TEXT,
    custom INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS passport_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source_path TEXT,
    preset_id TEXT,
    settings_json TEXT,
    output_path TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_passport_projects_updated ON passport_projects(updated_at DESC);