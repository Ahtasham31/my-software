# Photo Editor Performance

## Memory strategy
- 15-entry undo history (full canvas snapshots).
- Live preview via CSS filter (no pixel copy on slider move).
- Pixel loops run only on Apply.
- Layer rendering flattens on demand, not on every pointer event.

## Large-image limits
- Very large images (>20 MP) will be slow for pixel-loop operations.
- Documented in the UI text.

## 4 GB target
- Works for typical JPG/PNG under 12 MP.
- Large TIFFs may exceed comfort — no hard cap enforced.