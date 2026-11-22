# OCR Performance Guide

## Targets
- 4 GB RAM: process one page at a time.
- 8 GB: 2 concurrent jobs.
- 16 GB: 4 concurrent jobs.

## Strategies
- Preprocess only when requested.
- Preview at reduced resolution (process pipeline downsamples for preview).
- Sequential batch by default; `maxConcurrentJobs` reserved for future.
- Temporary files cleaned after each operation.
- No image data cached beyond the active tab.

## Observations
- Tesseract on 200 DPI grayscale A4 ~2–4s on i5-class CPUs.
- Urdu / Arabic packs ~30–50% slower than English.
- Searchable PDF generation dominated by `pdftoppm` render time.
- `pdftoppm` at 150 DPI vs 300 DPI — 4× faster and adequate for search.

## Tuning
- Prefer 150 DPI for searchable PDF unless user needs hi-res.
- Use `tessdata_fast` packs for speed; `tessdata_best` for quality-critical
  one-off jobs.