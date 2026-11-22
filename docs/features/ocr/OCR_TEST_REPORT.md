# OCR Test Report

## Status
Not executed in authoring environment. Manual verification checklist below.

## Prerequisites
- Tesseract 5.x installed with eng, urd, ara packs.
- Poppler (pdftoppm) on PATH.

## Checklist
1. Dashboard shows "Ready" with Tesseract version and Poppler available.
2. Image to Text:
   - Import JPG → preview renders.
   - Preprocess Standard → preview updates.
   - Language English → Run OCR → text appears.
   - Confidence badge shows average; Show words lists per-word.
   - Save TXT → file written.
   - Save DOCX → opens in Word.
3. Urdu test:
   - Import Urdu document scan → lang=urd → OCR → RTL textarea.
   - Save DOCX → opens RTL-aligned.
4. PDF to Text:
   - Import text PDF → Extract → per-page text with "text" badges.
   - Import scanned PDF → Extract → pages show "no text".
   - Run OCR fallback → progress → text appears.
   - Save TXT, Save DOCX (multi-page), Save Searchable PDF.
   - Open saved PDF → text is selectable / searchable.
5. Language Manager:
   - Shows installed vs not-installed.
   - Install from file: pick `urd.traineddata` → success badge.
6. Batch OCR:
   - Add 3 images, set output folder → Run → 3 result badges.
   - Check output folder has 3 .txt files.
7. History:
   - Past jobs listed with status, lang, pages, duration.
   - Delete individual → row removed.
   - Clear all → table empty.
8. Settings persist across restart.

## Build