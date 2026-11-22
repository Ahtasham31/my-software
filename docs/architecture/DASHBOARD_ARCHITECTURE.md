# Dashboard Architecture

## Data source
- `dashboard_summary` (counts + storage sizes via `walkdir`)
- `projects_list`
- `recent_list(10)`
- `activity_list(8)`

All loaded in parallel via `useDashboard()` hook. Dashboard never fabricates data.

## Widgets
- WelcomeWidget — date + greeting
- QuickActionsWidget — real routes for `/files`, `/projects/new`; disabled for not-yet-implemented modules
- RecentProjectsWidget — first 6 projects
- RecentFilesWidget — first 10 recent items
- ActivityWidget — last 8 activity entries
- StorageWidget — per-folder byte totals
- SystemInfoWidget — counts + storage root

## Not implemented in Phase 04
- Dashboard widget reordering (deferred; the spec's "customization" is handled by Phase 15 Settings)
- Personalized name (no user profile system exists)