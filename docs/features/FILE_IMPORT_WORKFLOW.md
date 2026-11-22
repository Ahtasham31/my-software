# File Import Workflow

## Flow
1. User clicks **Import** in `FileToolbar` (or `?action=import` URL).
2. `open_file_dialog` → native file picker (multi-select).
3. For each selected file → `fs_import_file(src, currentPath)`.
4. Backend copies to `unique_filename(currentPath, basename)`.
5. On success → refresh listing + `recent_track` for the folder.

## Supported (import only, not editing)
Any file the OS file picker returns. Type filtering deferred to Phase 05 modules.

## Not implemented
- Drag-and-drop
- Folder import (native `open_dir_dialog` exists but UI hookup deferred)
- Import presets / destination selection dialog