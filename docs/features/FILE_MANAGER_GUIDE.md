# File Manager Guide

## Locations
- Projects, Documents, Images, Templates, Exports, Backups
- All paths resolved via `storage_paths` (Phase 03)

## Operations
| Operation | Command | Safety |
|---|---|---|
| Browse | `fs_browse` | Rejects paths outside storage root |
| Import | `fs_import_file` | Unique filename, copies (never moves) |
| Rename | `fs_rename_path` | Rejects existing target |
| Delete | `fs_delete_path` | Confirmation dialog required |
| New folder | `fs_create_folder` | Rejects existing name |
| Reveal in OS | `fs_reveal_in_os` | Uses OS shell, no arbitrary exec |

## Views
- Grid view (default)
- List view (table)
- Persisted per session (local state; SQLite persistence deferred to Phase 15)

## Not implemented
- Copy/move between folders (deferred — imports cover cross-folder copy)
- Thumbnail generation for images (Phase 05, Photo Editing Studio)
- Drag-and-drop import (native file picker only in Phase 04)