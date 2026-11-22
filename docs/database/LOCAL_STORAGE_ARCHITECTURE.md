# Local Storage Architecture

## Root
`<app_data_dir>/DocuVerseStudio/`

## Subdirectories
`database/`, `projects/`, `documents/`, `images/`, `thumbnails/`, `templates/`,
`exports/`, `backups/`, `cache/`, `temporary/`, `logs/`, `settings/`.

## Ownership
- Application binaries live outside this root (installer-managed).
- User documents are stored under `projects/`, `documents/`, `images/`, `exports/`.
- Temp and cache are application-owned and may be swept safely.

## Invariants
- Uninstall, module removal, or license expiry never deletes user documents.
- Only `temporary/` and `cache/` are eligible for automatic cleanup.