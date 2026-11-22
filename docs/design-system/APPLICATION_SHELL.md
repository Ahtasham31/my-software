# Application Shell

## Structure



## Sidebar
- Collapsible (icon-only when collapsed).
- Grouped navigation: Workspace, Create, Documents, Hardware, Content, System.
- Active state via `NavLink`.
- Tooltips in collapsed mode.

## Header
- Page title from route.
- Command palette trigger (`Ctrl/⌘ + K`).
- Theme toggle, notifications, settings shortcut.

## Status bar
- Ready state, current theme name, local-first indicator, version/phase tag.

## Providers
- `ToastProvider` → toasts.
- `ConfirmProvider` → confirmation dialogs.
- `TooltipProvider` → tooltip delay.

## Keyboard
- `Ctrl+K` / `⌘+K` opens the command palette.
- `Escape` closes overlays.