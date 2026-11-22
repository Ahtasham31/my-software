CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    item_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    label TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_created ON favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_type, item_id);