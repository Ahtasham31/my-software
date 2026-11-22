# STORAGE ARCHITECTURE — DocuVerse Studio

## 1. Zones
Application installation and customer data are strictly separated.

### Application zone (installed binaries)
- Executables, dylibs, module binaries, bundled resources (help, templates,
  themes, language packs shipped with base).
- Overwritten on update; never contains user documents.

### Customer data zone (outside app)
- User documents & project files.
- SQLite database.
- Backups.
- Recovery snapshots.
- Cache.
- Temp job files.
- Logs.
- Installed optional modules.
- Exported settings/themes.

## 2. Suggested Directory Layout (cross-platform)
Use OS-appropriate data locations resolved at runtime by the Rust core:
- `data_dir/documents/…` (user projects and outputs)
- `data_dir/db/docuverse.sqlite`
- `data_dir/backups/`
- `data_dir/recovery/`
- `data_dir/cache/`
- `data_dir/temp/jobs/<job_id>/`
- `data_dir/logs/`
- `data_dir/modules/`
- `data_dir/themes/`, `data_dir/presets/`
- `config_dir/settings-export/`

The exact root is chosen per OS by the Rust core; never hard-coded in UI.

## 3. Data Classes
- **Primary user data**: documents, projects — never auto-deleted.
- **Derived data**: thumbnails, caches — safe to rebuild.
- **Transient data**: job temp files — cleaned on job end / startup sweep
  with conservative rules (only under `temp/jobs`).
- **Configuration**: settings, themes, presets — versioned and exportable.

## 4. Migrations
- SQLite migrations handled by Rust DB layer.
- File-layout migrations handled by a dedicated file-migration service with
  dry-run, logging, and rollback where practical.
- User documents are not rewritten by migrations without explicit consent.

## 5. Backup Strategy
- Automatic local backups (configurable interval) for DB and project metadata.
- Manual backups on demand.
- Restore requires explicit confirmation.
- Restore never deletes the live copy until restore succeeds and integrity
  checks pass.

## 6. Cleanup Rules
- Temp sweeps only target `temp/jobs/…` older than configured threshold.
- Cache eviction respects configured limits.
- No sweep targets `documents/`, `backups/`, `recovery/` without user action.

## 7. Path Safety
- All paths resolved and validated; reject `..` and symlink escapes.
- Imports validated against expected type and size.
- Writes use temp + atomic rename.

## 8. Invariants
- Uninstall never deletes customer data zone.
- Module uninstall never touches customer data zone.
- License expiry never touches customer data zone.