# Dashboard UI Specification

## Sections
1. Welcome header with phase/trial badge.
2. Quick actions grid (8 tiles): Open File, New Project, Import Image,
   Scan Document, Convert File, Create ID Card, Open PDF, Browse Templates.
3. Recent projects (empty state in Phase 02).
4. Available modules (badge grid).
5. Background jobs (placeholder, real data in later phases).
6. Storage usage (placeholder).
7. License & backup status (sample markers).

## Honesty Rules
- Sample data clearly labeled ("Sample data").
- No real backup, license, or storage metric is fabricated.
- CTA buttons in Phase 02 navigate to placeholder routes and are functional
  (they do not pretend to open a file dialog).

## Layout
- Responsive grid: 1 col → 2 col → 3 col as width grows.
- Uses `PageContainer` max-width 1400px.