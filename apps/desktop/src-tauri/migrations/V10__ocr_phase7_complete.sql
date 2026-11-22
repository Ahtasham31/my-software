ALTER TABLE ocr_jobs ADD COLUMN confidence_avg REAL;
ALTER TABLE ocr_jobs ADD COLUMN language_pack_version TEXT;

CREATE TABLE IF NOT EXISTS ocr_language_installs (
    code TEXT PRIMARY KEY,
    installed_at TEXT NOT NULL DEFAULT (datetime('now')),
    source TEXT NOT NULL,
    file_size_bytes INTEGER
);