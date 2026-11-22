# Phase 06 Completion Report — Passport Photo Studio

## Delivered
- `/passport` route with dedicated workspace and `/passport/batch` for bulk.
- 10 built-in presets + custom preset creation/deletion (SQLite `passport_presets`).
- Import single image via native picker or drag-and-drop.
- Manual positioning: offset X/Y, scale, rotation, drag on canvas.
- 6 configurable draggable guides (head top, eye line, chin, shoulders, face center, safe margin).
- Background presets: white, light grey, blue, light blue, red, light red, 2 gradients, transparent.
- Custom backgrounds: create/delete solid or gradient presets (SQLite `passport_backgrounds`).
- Custom color background (hex picker).
- Background removal: magic wand (with tolerance + feather) and eraser brush.
- Enhancement: brightness, contrast, exposure, saturation, temperature, sharpness, noise reduction.
- Print sheet preview: 4×6, A4, A5, custom with adjustable margins and gap.
- Print button (opens native OS print dialog via hidden iframe).
- Export single photo (PNG/JPEG/WebP with quality slider).
- Export sheet as PNG.
- Before/After A/B toggle.
- Save project metadata (SQLite `passport_projects`).
- Open recent project with settings restore.
- Batch passport generation: add files → pick preset + bg + output dir → generate.
- Status bar shows preset, pixel dimensions, DPI, source filename.

## Non-AI guarantee
- No face detection, no biometric analysis, no generative enhancement.
- All operations use traditional pixel manipulation and CSS filters.
- No network usage. All processing is local.

## Not delivered (documented limitations)
- Multi-photo projects (tabs) — single photo per session in the editor.
- Batch: per-image foreground offset — uses center-fit; use editor for individual alignment.
- Automatic face detection — explicitly excluded by spec.

## Database
- `passport_presets`, `passport_projects`, `passport_backgrounds` tables.

## Next phase
Phase 07 — OCR Studio. Do not start until explicitly requested.