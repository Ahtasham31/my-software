# Searchable PDF Generation

## Flow
`ocr_create_searchable_pdf`:

1. For each page in `page_texts`:
   - Render original PDF page to PNG at DPI (default 150) via `pdftoppm`.
   - Load PNG as `image::DynamicImage`.
2. Build new PDF with `printpdf`:
   - Page size matches rendered image at that DPI.
   - Image drawn as full-page background (original appearance preserved).
   - Text drawn as small white-colored Helvetica overlay positioned
     line-by-line from top of page.
3. Save output PDF.

## Searchability
Text is embedded in the PDF content stream, so PDF readers can select and
search it. The visual appearance is unchanged because the text is white.

## Limitations (documented)
- Text is **not invisible** in render mode 3 — it is white-colored. On
  some PDF readers with dark backgrounds the text may be visible.
- Urdu/Arabic text in the searchable layer uses Helvetica fallback; the
  glyphs will not render correctly even though the Unicode codepoints are
  present. Search still works on the raw codepoints.
- Word positions are approximate (line-by-line). Precise word-positioning
  would require parsing Tesseract TSV box coordinates for each word.
- Multi-column layouts: text is placed line-by-line at left margin, so
  searchable text order may not match visual order for complex layouts.