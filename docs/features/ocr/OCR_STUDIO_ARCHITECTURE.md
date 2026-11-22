# OCR Studio Architecture

## Layout


## Backend (Rust)
- `commands/ocr.rs`:
  - Engine: `ocr_check_engine`, `ocr_list_languages`
  - Preprocessing: `ocr_preprocess_preview`
  - Recognition: `ocr_recognize_image`, `ocr_recognize_image_tsv`,
    `ocr_recognize_pdf_page`
  - PDF: `ocr_extract_pdf_text`, `ocr_render_pdf_page`,
    `ocr_create_searchable_pdf`, `ocr_pdf_to_docx`
  - Output: `ocr_save_text`, `ocr_save_docx`
  - Jobs: `ocr_job_save`, `ocr_jobs_list`, `ocr_job_delete`, `ocr_jobs_clear`
  - Language packs: `ocr_install_language_pack`, `ocr_language_pack_info`

## Engine adapter
Tesseract CLI is invoked via `Command::new("tesseract")` with stdout capture.
Poppler's `pdftoppm` is invoked for PDF page rendering. Both binaries are
user-installed; the app never bundles them.