# File Operations and Safety

## Rules enforced in Rust
- All write/delete operations call `validate_within_root`.
- `fs_delete_path` never targets user-document directories outside storage root.
- `fs_import_file` uses `unique_filename` (never overwrites).
- `fs_rename_path` rejects if destination exists.

## Rules enforced in frontend
- Delete requires `useConfirm` dialog.
- Rename via prompt (simple; a proper dialog will replace it in Phase 05+).
- No file path is constructed from user-typed input without backend validation.

## Preservation invariant
Deleting a project with `deleteFiles=false` **never** touches filesystem. Uninstall, license expiry, and module removal never run any of these commands.