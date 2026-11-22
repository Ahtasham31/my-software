-- Phase 04 additions: dashboard preferences + index for search
CREATE TABLE IF NOT EXISTS dashboard_preferences (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    prefs_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
CREATE INDEX IF NOT EXISTS idx_recent_items_type ON recent_items(item_type, last_opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags_label ON tags(label);