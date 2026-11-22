# OCR Language Support

## Installed detection
`tesseract --list-langs` returns installed traineddata names. These are
matched against the known list in `ocr_list_languages`.

## Bundled
No traineddata is bundled. Users install via:
1. UB Mannheim Tesseract installer with additional language selection.
2. Manual download from tesseract-ocr/tessdata_fast.
3. App's Language Manager: pick a local `.traineddata` file → the app copies
   it into `<tesseract>/tessdata/`.

## Languages documented
- English (`eng`) — tested widely, high accuracy on clear scans.
- Urdu (`urd`) — supported; Nastaliq accuracy varies with scan quality.
- Arabic (`ara`) — supported; accuracy similar to Urdu.
- Others detected if installed (Hindi, Persian, French, German, Spanish,
  Chinese Simplified, Japanese, Russian).

## Selection
Image to Text, PDF to Text, and Batch all expose a language dropdown that
filters to installed languages. Non-installed languages are shown but
disabled with an "Install" affordance pointing to Language Manager.