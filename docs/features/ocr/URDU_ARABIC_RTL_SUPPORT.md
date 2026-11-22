# Urdu / Arabic RTL Support

## Text output
Tesseract returns Unicode text. The textarea in Image to Text and PDF to
Text applies `dir="rtl"` when the language is `urd` or `ara`.

## DOCX export
`ocr_save_docx` and `ocr_pdf_to_docx` set:
- `run.rtl()` — right-to-left flag on the run
- `para.bidi()` — bidirectional paragraph

Result opens in Word/LibreOffice with correct right alignment.

## Review workspace
Review page has an RTL toggle and uses `Noto Nastaliq Urdu` font when RTL
is enabled. Users can toggle per document.

## Known limitations
- Nastaliq shaping depends on Tesseract's `urd.traineddata` version.
- Mixed-language documents (English + Urdu in same line) can produce
  reversed word order in rare cases. Manual correction in the Review
  workspace is the workaround.