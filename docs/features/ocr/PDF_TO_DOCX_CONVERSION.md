# PDF to DOCX Conversion

## Command
`ocr_pdf_to_docx` takes:
- `source_pdf_path` (metadata only, not used for rendering here)
- `output_path`
- `pages` (page + text pairs)
- `rtl` flag
- `font_family` (default Arial)
- `font_size` (default 24 half-points)

## Logic
- Splits each page text on `\n\n` into blocks.
- If multiple blocks exist, each block is added as a paragraph, followed by
  an empty paragraph (visual separation).
- Within a block, lines become paragraphs.
- RTL flag adds `run.rtl()` and `para.bidi()` to every paragraph.

## Limitations
- Tables and multi-column layouts are flattened into linear text.
- Heading hierarchy not preserved (all text same size by default).
- Images from original PDF are not embedded (text only).
- Original PDF is never modified.

## DOCX writer
Uses `docx-rs` crate (MIT).