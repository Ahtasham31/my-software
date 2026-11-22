CREATE TABLE IF NOT EXISTS passport_backgrounds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('solid','gradient')),
    color1 TEXT NOT NULL,
    color2 TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_passport_backgrounds_created ON passport_backgrounds(created_at DESC);