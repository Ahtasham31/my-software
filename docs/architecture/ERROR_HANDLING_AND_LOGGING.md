# Error Handling and Logging

## Error categories
`database`, `migration`, `storage`, `not_found`, `validation`, `permission`, `internal`.

`AppError` → `CommandError { category, message, detail? }` serialized to frontend.
`invokeNative` wraps thrown errors into the same shape.

## Logging
- `tracing` + `tracing-subscriber` + `tracing-appender`.
- Daily rotation: `logs/docuverse.log.YYYY-MM-DD`.
- Default filter: `info,docuverse_studio_lib=debug`.
- Frontend can log via `log_frontend` command (level, message, context).

## Rules
- Never log document contents, passwords, or secrets.
- Use `warn` for recoverable anomalies, `error` for failed operations.
- Diagnostic export is not implemented in Phase 03 (foundation only).