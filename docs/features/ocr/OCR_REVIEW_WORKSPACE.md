# OCR Review Workspace

## Purpose
Proofread and correct OCR output before export.

## Features
- Editable textarea (monospace font).
- LTR/RTL toggle.
- When RTL, uses `Noto Nastaliq Urdu` font for correct shaping display.
- Save as TXT or DOCX (RTL preserved).

## Workflow
1. Run any OCR operation.
2. Copy or auto-populate the review workspace (manual paste currently).
3. Proofread, correct errors.
4. Save.

## Not implemented
- Side-by-side original image (single image preview is available on the
  Image to Text page).
- Multi-page navigation within Review (each page exports independently).
- Confidence-based auto-highlight of low-confidence words (confidence is
  shown on Image to Text page).