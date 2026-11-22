# Recent Items and Activity

## Recent items
- Table: `recent_items`
- Deduplicated by `path` (delete + insert on same path).
- Capped at 100 rows per `recent_track` cleanup query.
- Exposed to UI via `recent_list(limit)`.
- `recent_clear` removes all (does not touch files).

## Activity
- Table: `activity_history`
- Events: `project.created`, `project.renamed`, `project.deleted`, `project.removed`, `project.duplicated`
- `activity_list(limit)` returns newest first.
- Future events (file.imported, etc.) will be added as modules appear.