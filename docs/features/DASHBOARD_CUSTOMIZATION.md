# Dashboard Customization

## Phase 04 scope
- Sections are fixed in `DashboardPage` (Welcome, QuickActions, RecentProjects, RecentFiles, Activity, Storage, SystemInfo).
- No show/hide/reorder UI yet.

## Deferred
- Widget visibility/reorder → Phase 15 (Settings & Module Manager)
- Compact/comfortable layout toggle → Phase 15
- Persistence via `dashboard_preferences` table (created in V2, currently unused)

Reason: dashboard customization wasn't required for Phase 04's core acceptance criteria (data loading + navigation), and belongs alongside the settings system.