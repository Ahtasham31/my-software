# Color Adjustment Guide

## GPU (CSS filter)
- Brightness (0–3)
- Contrast (0–3)
- Saturation (0–3)
- Hue (±180°)
- Blur (0–20 px)
- Grayscale (0–1)
- Sepia (0–1)
- Invert (0–1)

## Pixel-loop
- Exposure (−2 … +2)
- Temperature (−100 … +100)
- Highlights, Shadows, Whites, Blacks (via `applyHighlightsShadows`)
- Vibrance (via `applyVibrance`)
- Gamma (via `applyGamma`)

## Workflow
Live preview uses CSS `ctx.filter`. Apply bakes adjustments into a new
canvas so subsequent operations work on the modified pixels.