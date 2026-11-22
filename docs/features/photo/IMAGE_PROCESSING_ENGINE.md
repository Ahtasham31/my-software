# Image Processing Engine

## Pure-Canvas approach
All operations run in the webview using the Canvas 2D API. No external
imaging service, no AI, no network.

## Adjustment baking
- CSS filters used for GPU-accelerated preview of brightness, contrast,
  saturation, hue, blur, grayscale, sepia, invert.
- Pixel-loop path for exposure, temperature, highlights, shadows, whites,
  blacks, vibrance, gamma.

## Filters
- Grayscale, sepia, invert, blur → CSS `ctx.filter`.
- Sharpen → 3×3 convolution.
- Median → 3×3 median window.
- Unsharp mask → blur + difference.
- Vintage, warm, cool → pixel loops.
- Auto-levels → per-channel min/max stretch.

## Selection masks
`Uint8Array` of length `width * height`. `1` = selected, `0` = not.

## Limitations
- Not GPU-accelerated for pixel-loop operations.
- Very large images (>20 MP) are slow for pixel loops; acceptable at
  4 GB target but not guaranteed smooth at every resolution.