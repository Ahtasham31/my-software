CREATE TABLE IF NOT EXISTS ocr_jobs (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    source_path TEXT NOT NULL,
    output_path TEXT,
    language TEXT NOT NULL,
    engine TEXT NOT NULL DEFAULT 'tesseract',
    status TEXT NOT NULL DEFAULT 'pending',
    page_count INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER,
    error_message TEXT,
    settings_json TEXT,
    preview_text TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ocr_presets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    settings_json TEXT NOT NULL,
    builtin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ocr_jobs_created ON ocr_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ocr_jobs_status ON ocr_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ocr_jobs_kind ON ocr_jobs(kind);