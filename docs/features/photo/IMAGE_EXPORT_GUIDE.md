# Image Export Guide

## Flow
1. Click Export in the toolbar.
2. Native save dialog opens with name `<source>.png` and format filters
   (PNG, JPEG, WebP, BMP).
3. Extension determines encoder:
   - `.png` → lossless PNG
   - `.jpg` / `.jpeg` → JPEG quality 0.92
   - `.webp` → WebP quality 0.92
   - `.bmp` → BMP via canvas.toDataURL
4. Rust `photo_save_image` decodes base64 and writes bytes to disk.

## Guarantees
- Original files untouched.
- User picks the destination path.
- No file is overwritten without the user's explicit save choice.