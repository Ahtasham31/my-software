# Search and Indexing Guide

## Backend
`commands/search.rs::global_search` — SQL `LIKE` queries over:
- `projects.name`
- `recent_items.path`, `recent_items.label`

Uses escaped `%`/`_` and `ESCAPE '\'`. Indexed columns: `projects.name`, `recent_items.path`.

## Frontend
- `GlobalSearch` component debounces 250 ms.
- Minimum query length: 2 characters.
- Empty result and loading states handled.

## Not implemented
- FTS5 full-text search (deferred — SQLite FTS5 requires an additional virtual table; kept simple in Phase 04)
- Tag search, settings search (schema exists, queries deferred)
- Filesystem-wide indexing (by design — Phase 04 only searches app-managed records)