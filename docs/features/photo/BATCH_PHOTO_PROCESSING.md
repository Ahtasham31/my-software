# Batch Photo Processing

## Delivered
- Add multiple source files via native multi-select picker.
- Choose output folder via native folder picker.
- Resize (width and/or height, aspect preserved when one is set).
- Convert format: PNG, JPEG, WebP, BMP, TIFF.
- Run batch → Rust `batch_resize` command decodes and re-encodes each file.
- Per-file success/failure report rendered as a list.
- Every batch logs a row in `batch_jobs` with total/processed/failed counts.

## Not delivered (documented)
- Batch crop with shared preset.
- Batch color adjustment / filter recipe.
- Batch rename.
- Batch watermark.
- Batch abort mid-run.
- Live per-file progress (only start and finish states).

The current UI supports resize + format conversion safely with real
filesystem and image-crate decoding. Additional recipe operations are
straightforward extensions via the Rust `batch_resize` command.