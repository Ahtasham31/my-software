# Project Management Guide

## Operations
| Operation | Command | Behavior |
|---|---|---|
| List | `projects_list` | Ordered by `updated_at DESC` |
| Create | `project_create` | Creates `storage/projects/<sanitized-name>`, unique folder on conflict |
| Rename | `project_rename` | Updates metadata only (folder rename deferred for safety) |
| Duplicate | `project_duplicate` | Recursive copy + new UUID |
| Delete | `project_delete(deleteFiles)` | `deleteFiles=false` → remove DB row only; `true` → also `remove_dir_all` if within storage root |

## Activity
Every operation logs an entry to `activity_history`.

## Not implemented
- Project description field (schema column omitted in Phase 03; add in a future migration)
- Thumbnails (needs image pipeline)
- Categories/tags UI (DB tables exist; UI deferred)