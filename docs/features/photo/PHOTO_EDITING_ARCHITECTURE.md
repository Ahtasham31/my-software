# Photo Editing Architecture

## Components
- `photo-editor-page.tsx` — workspace shell
- `use-photo-editor.ts` — canvas pipeline (image load, crop, resize, filters, undo/redo, export)
- `use-layers.ts` — non-destructive layer model
- `engine/image-engine.ts` — pure canvas operations (adjustments, filters, resize, crop, watermark primitives)
- `engine/layer-renderer.ts` — composite layers into final canvas
- `engine/selection-tools.ts` — mask generation (rect, ellipse, lasso, feather, invert)
- `engine/magic-wand.ts` — flood-fill color selection
- `engine/watermark.ts` — text watermark

## Data flow
1. Load → Rust command `photo_load_image` → base64 data URL → HTMLImageElement → offscreen canvas.
2. Editing operations run on the working canvas; layer composition uses `renderLayers`.
3. Export → canvas.toDataURL → Rust `photo_save_image` → file on disk.

## Non-destructive strategy
- Layers keep independent pixel/text/shape data.
- Flattening happens only when exporting or when an adjustment is applied.
- Undo history stores flattened snapshots (15 entries max).