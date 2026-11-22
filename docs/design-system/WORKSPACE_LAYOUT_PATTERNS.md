# Workspace Layout Patterns

Reusable layout patterns for future modules — no module logic implemented here.

## Editing workspace


## Document workspace
- Page list (thumbnail rail) · main preview · properties panel.
- Toolbar spans full width above the three columns.

## Data workspace
- Filter bar → table/list → detail panel (right).
- Bulk action bar appears when selection is non-empty.

## Processing workspace
- Left: file selection.
- Center: settings form.
- Right: queue + progress.
- Bottom: results list.

## Guidance
- Every pattern is a CSS grid. Panels may collapse via state.
- Resizable panels use the future `ResizablePanel` primitive; Phase 02 ships
  static grid equivalents that are easy to upgrade