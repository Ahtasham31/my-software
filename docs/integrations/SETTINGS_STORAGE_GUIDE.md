# Settings Storage Guide

## Persistence
Single row in `app_settings` with `key = 'app'` and `value_json = AppSettings`.

## Schema (TypeScript)
See `src/types/models.ts` — `AppSettings`, `AppearanceSettings`,
`GeneralSettings`, `PerformanceSettings`.

## Flow
1. `SettingsProvider` calls `settings_get` on mount.
2. `ThemeProvider` reads `settings.appearance` and applies tokens.
3. Any appearance change → `settings_set` → DB updated → restart-safe.

## Reset
`settings_reset` overwrites the row with `AppSettings::default()`.

## Not implemented (future phases)
- Import/export JSON
- Per-module settings UI
- Validation beyond serde type-checking