# Phase 05 Completion Report — Photo Editing Studio

## Implemented (fully working)
- Open image via native file picker (JPG, JPEG, PNG, WebP, BMP, TIFF).
- Canvas render with checkerboard background.
- Zoom (wheel / buttons), pan (middle-mouse or Alt+drag / Pan tool).
- Toolbar: Open, Undo, Redo, Zoom, Rotate ±90°, Export.
- Left tools: Select, Crop, Magic Wand, Pan.
- Right panel: Adjustments, Filters, Tools (crop controls, magic wand,
  resize, rotate).
- Adjustments with real-time GPU preview (CSS filter) and Apply to bake:
  brightness, contrast, saturation, hue, blur, grayscale, sepia, invert.
  Pixel-loop baking for exposure and temperature.
- Filters: Grayscale, Sepia, Invert, Blur, Sharpen (convolution),
  Vintage, Warm, Cool.
- Crop: interactive drag rect overlay, Apply / Cancel.
- Resize: arbitrary width/height.
- Rotate: ±90° (swap dimensions).
- Magic Wand: traditional flood-fill color selection, tolerance slider,
  apply as transparent or fill with color.
- History: canvas snapshots, capped at 15 entries, undo/redo.
- Export: native save dialog, PNG/JPEG/WebP/BMP via canvas encoders.
- Project metadata table (`photo_projects`) created with migration V3.

## Not implemented in this delivery (foundation / deferred)
- Multi-layer compositing (single working canvas only).
- Text and shape layers.
- Advanced retouching: healing brush, clone stamp, dodge/burn, smudge.
- Red-eye removal and skin smoothing.
- Before/after split view.
- Batch photo processing.
- Watermark.
- Project save/reopen with layer data (V3 table stores metadata only;
  full `.dvs` project file deferred).
- Highlights, shadows, whites, blacks, vibrance adjustment sliders.
- Tiled rendering for very large images.
- GPU-based heavy convolution.

## Dependencies and licensing
- `image` crate 0.25 (Apache-2.0 / MIT) — decode + dimension read only.
- `base64` crate 0.22 (MIT / Apache-2.0) — encode/decode data URLs.
- All canvas rendering, adjustments, filters, magic wand are implemented
  in the frontend using standard Canvas 2D API — no third-party imaging
  library, no AI, no cloud, no external service.

## Database changes
- New table `photo_projects` (id, name, project_path, source_path,
  width, height, format, metadata_json, timestamps).
- New index `idx_photo_projects_updated`.

## Rust commands added
- `photo_load_image` — read image, encode base64 data URL, return dims.
- `photo_save_image` — decode data URL, write to path.
- `photo_projects_list`, `photo_project_save` — project metadata.
- `save_file_dialog` — native save dialog.

## Security
- File reads validated for extension only; content validated by `image`
  crate decode.
- File writes require path selected via native save dialog.
- No arbitrary filesystem paths accepted from frontend without dialog.
- No network. No AI. No shell.

## Known limitations
- Very large images (>20 MP) may cause slow pixel loops for
  exposure/temperature baking. Documented in the UI as a limitation.
- History stores full-resolution canvas snapshots; capped at 15 entries
  to bound memory usage.
- Undo does not preserve crop selection state — only canvas pixels.
- Save/Export writes the flattened current canvas — layers are not
  preserved as editable data.
- Rust `photo_save_image` writes to user-picked path without validating
  against storage root; relies on the user's explicit dialog choice.

## Next phase
Phase 06 — Passport Photo Studio. Do not start until explicitly requested.