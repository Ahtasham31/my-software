# OCR Security and Privacy

## Local-only
- Tesseract and Poppler run locally. No network calls.
- No AI models, no cloud OCR.
- Extracted text never leaves the machine unless user exports it.

## File safety
- Originals opened read-only.
- Temp files under OS temp: `docuverse-ocr`, `docuverse-ocr-preview`,
  `docuverse-ocr-tsv`, `docuverse-pdf-ocr`, `docuverse-pdf-render`,
  `docuverse-searchable-pdf` — all removed after use.
- Output paths must be selected by user via native save dialog.

## Language packs
- User-provided `.traineddata` files.
- No automatic downloads in-app.
- Copy into tessdata may require admin rights; error is surfaced clearly.

## Diagnostics
- Job records stored in SQLite (`ocr_jobs`).
- No document content logged in application_logs.
- `previewText` limited to first 200 chars.