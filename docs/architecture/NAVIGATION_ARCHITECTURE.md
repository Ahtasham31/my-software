# Navigation Architecture

## Routing
- React Router v6 with `future: { v7_startTransition, v7_relativeSplatPath }`
- Routes declared in `App.tsx` from `NAV_GROUPS`
- Sidebar items with `placeholder: true` route to `ModulePlaceholderPage`
- `/files` is a real route → `FileManagerPage`
- `*` → redirect to `/`

## Active state
- `NavLink` `isActive` class in `Sidebar`
- Breadcrumb title derived from `NAV_LOOKUP[pathname]`

## Sidebar
- Collapse state local to `AppShell` (persistence deferred)
- Groups: Workspace, Create, Documents, Hardware, Content, System

## Keyboard
- `Ctrl/⌘ + K` → command palette (Phase 02)
- Global search is currently in the command palette; dedicated `GlobalSearch` component exists for embed in Header (Phase 05+)