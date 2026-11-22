# OCR Image Preprocessing

## Options
| Option | Type | Effect |
|---|---|---|
| Rotation | 0/90/180/270 | Rotate image |
| Grayscale | bool | Convert to grayscale |
| Threshold | 0–255 / off | Binarize |
| Invert | bool | Invert colors |
| Brightness | −100…+100 | Additive offset |
| Contrast | 0.5…2.0 | Multiplicative around 128 |

## Presets
- **Standard Document** — grayscale
- **Low-Quality Scan** — grayscale + high contrast + threshold 160
- **Newspaper** — grayscale + threshold 140
- **Book Page** — grayscale + brighten 5 + contrast 1.1
- **Urdu Document** — grayscale + contrast 1.15
- **Arabic Document** — grayscale + contrast 1.15
- **Receipt** — grayscale + threshold 170 + high contrast
- **Photograph of Document** — grayscale + brighten 8 + contrast 1.2

## Preview
`ocr_preprocess_preview` returns a base64 PNG for display. Original file is
never modified.