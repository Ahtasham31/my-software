# Cross-Platform Core Compatibility

## Path resolution
Uses `app.path().app_data_dir()` from Tauri 2, which maps to:
- Windows: `%APPDATA%/com.docuverse.studio` (then `DocuVerseStudio/`)
- macOS: `~/Library/Application Support/com.docuverse.studio`
- Linux: `~/.local/share/com.docuverse.studio`

## SQLite
Bundled SQLite (`rusqlite` `bundled` feature) — no system dependency.

## Filesystem
Only `std::fs` APIs; no Windows-only assumptions.
Path validation canonicalizes paths before prefix checks.

## Limitations (Phase 03)
- No scanner, printer, or hardware integration.
- No native file dialogs yet (Phase 04 will add file manager).
- No code signing or installer packaging yet (Phase 18).