# File Safety Policy

## Never
- Never delete user documents automatically.
- Never overwrite an existing file without explicit confirmation.
- Never write outside the `DocuVerseStudio` root via native commands.
- Never execute shell commands from the frontend.

## Always
- Validate paths via `validate_within_root` before writes.
- Write to a temp file then atomically rename.
- Generate unique filenames when importing (Phase 04 will use `unique_filename`).
- Use SQLite transactions for multi-step DB writes.