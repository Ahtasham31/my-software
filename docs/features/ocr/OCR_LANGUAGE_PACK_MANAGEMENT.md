# Language Pack Management

## Detection
`ocr_list_languages` runs `tesseract --list-langs`. Languages in the known
list are marked installed/uninstalled.

## Install from file
`ocr_install_language_pack`:
1. Validate source ends with `.traineddata`.
2. Locate tesseract binary via `where` (Windows) / `which` (Unix).
3. Compute tessdata dir = `<binary_dir>/tessdata`.
4. Copy file there. Admin rights may be required.
5. Record in `ocr_language_installs` table.

## Where to get packs
User-facing link in Language Manager points to:
https://github.com/tesseract-ocr/tessdata_fast

Standard, fast, and best variants exist. Fast is recommended for interactive
OCR. Best for quality-critical scans (larger, slower).

## Not implemented
- In-app download (user must download manually and install via file picker).
  Reason: respect for redistribution licenses and OS permission constraints.
  