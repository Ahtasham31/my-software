# OCR Known Limitations

## Engine
- Requires Tesseract and Poppler installed externally.
- No bundling — redistribution/licensing deferred.
- Engine version affects accuracy; not all packs equivalent.

## Searchable PDF
- Text is white, not fully invisible (render mode 3 not used by printpdf 0.7
  API).
- Non-Latin glyphs in search layer use Helvetica fallback; search works on
  codepoints only.
- Word positioning is line-level, not word-level (precise positioning
  requires per-word TSV boxes; deferred).
- Complex layouts (multi-column) may have scrambled search order.

## PDF to DOCX
- Tables and multi-columns flattened.
- Headings not distinguished by size.
- Images in original PDF not embedded.
- Original PDF layout not preserved.

## Urdu / Arabic
- Nastaliq accuracy strongly depends on scan quality.
- Mixed-direction lines can produce reversed order; use Review workspace.

## Batch
- Sequential (no parallelism in UI).
- No pause/resume.
- Duplicate output filenames overwrite silently.

## Layout / tables
- Not implemented. Text extraction is linear.
- Confidence bars show per-word but no automatic highlighting of low-confidence
  regions.

## Language packs
- No in-app download.
- Copy into tessdata requires admin rights on Windows for Program Files.