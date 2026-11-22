CREATE TABLE IF NOT EXISTS batch_jobs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    total INTEGER NOT NULL DEFAULT 0,
    processed INTEGER NOT NULL DEFAULT 0,
    failed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    recipe_json TEXT,
    output_dir TEXT,
    error_report_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_batch_jobs_created ON batch_jobs(created_at DESC);