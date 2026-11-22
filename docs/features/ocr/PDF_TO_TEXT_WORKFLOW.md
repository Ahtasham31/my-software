# PDF to Text Workflow

1. User picks a PDF.
2. Click Extract → `ocr_extract_pdf_text` uses `lopdf` to pull text from each
   page. Pages with ≥ 3 chars are marked "has text"; empty pages marked
   "no text".
3. If any page is empty AND Poppler is installed, an OCR fallback banner
   appears.
4. Run OCR fallback → for each empty page:
   - `ocr_recognize_pdf_page` renders page via `pdftoppm`, preprocesses,
     runs Tesseract TSV, returns text + confidence.
5. Results shown per-page with status badges.
6. Export options:
   - TXT (all pages concatenated with separators)
   - DOCX (via `ocr_pdf_to_docx` — paragraphs preserved; RTL for urd/ara)
   - Searchable PDF (only when all pages have text)