# Image Format Support

## Input
| Format | Extension | Decoder |
|---|---|---|
| JPEG | .jpg, .jpeg | Rust `image` crate + browser decode |
| PNG | .png | Same |
| WebP | .webp | Same |
| BMP | .bmp | Same |
| TIFF | .tif, .tiff | Same |

## Output
| Format | Notes |
|---|---|
| PNG | Preserves transparency |
| JPEG | Quality 0.92; no transparency |
| WebP | Quality 0.92 |
| BMP | From canvas |

## Not supported
- HEIC, AVIF, PSD, RAW formats — deferred to future phases.

## Preservation
- Original files never overwritten.
- Export requires explicit save dialog with user-chosen path.