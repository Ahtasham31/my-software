# Image to Text Workflow

1. User picks image (JPG/PNG/BMP/TIFF/WebP) via native picker.
2. Preview shown (source + processed toggle).
3. User selects language (installed only), PSM, preset or custom
   preprocessing.
4. Run OCR → backend preprocesses → tesseract TSV → parses words,
   confidence, avg confidence.
5. Extracted text displayed in editable textarea (RTL aware).
6. Confidence badge with word-level hover shows per-word scores.
7. Save as TXT or DOCX (Urdu/Arabic → RTL DOCX).
8. Job recorded in `ocr_jobs`.