# OCR Batch Processing

## Flow
1. Add multiple images via multi-file picker.
2. Choose language + preprocessing preset.
3. Choose output folder via native picker.
4. Run → iterate sources:
   - `ocr_recognize_image` per file.
   - Save `.txt` next to output folder with `{basename}.txt`.
   - Log to `ocr_jobs` with status.
5. Show per-file result badges (OK / ERR).

## Constraints
- Sequential processing (no parallel jobs in UI yet). Backend `maxConcurrent`
  setting is stored but not enforced.
- No pause/resume yet.
- Duplicate filenames overwrite in output folder (documented; user selects
  unique output folder).