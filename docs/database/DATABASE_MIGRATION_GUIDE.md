# Database Migration Guide

## Engine
`refinery` with `rusqlite` feature. Migration files live in `src-tauri/migrations/`
and are embedded at compile time via `embed_migrations!`.

## Naming
`V<number>__<description>.sql` — sequential, never renamed after release.

## Rules
- Each migration runs inside a transaction (refinery default).
- Never drop or recreate user tables in a migration.
- Never delete user data to recover from a failed migration.
- Schema version is tracked in `refinery_schema_history`.

## Adding a migration
1. Create `V2__add_feature.sql`.
2. Add SQL with `IF NOT EXISTS` / `IF EXISTS` where sensible.
3. Build; refinery applies pending migrations on next startup.
4. Write a test in `src-tauri/tests/migrations.rs`.

## Failed migration recovery
- App startup fails and shows an error; window is not opened.
- User can restore a database backup (Phase 13 will expose this UI).
- No automatic reset of the database.