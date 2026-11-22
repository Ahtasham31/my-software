# OCR Engine Adapter Guide

## Detecting engines
- `ocr_check_engine` runs `tesseract --version` and parses the first line.
- Poppler availability is checked via `pdftoppm -v`.

## Language listing
- `ocr_list_languages` runs `tesseract --list-langs` and matches against
  a known list (eng, urd, ara, hin, fas, fra, deu, spa, chi_sim, jpn, rus).

## Recognition modes
- Plain text: `tesseract <img> stdout -l <lang>` (via `ocr_recognize_image`).
- TSV with confidence: `tesseract <img> <out> -l <lang> tsv`
  (via `ocr_recognize_image_tsv`).

## Preprocessing
Done in Rust using the `image` crate:
- Rotation (90/180/270)
- Grayscale conversion
- Brightness offset
- Contrast multiplier
- Threshold binarization
- Invert

No external engine called for preprocessing.

## Extensibility
To add another engine, add a new command that follows the same input/output
shape. The frontend calls the command by name, so switching engines is a
matter of adding a new command plus UI selector.