# Crop and Resize Guide

## Crop
- Tool: `crop` in toolbar.
- Drag over the canvas to define region; a highlighted rect appears.
- Apply / Cancel buttons in the Tools tab.
- Fixed aspect ratios: not exposed in v1 UI; users can resize after crop.

## Resize
- Inputs: width and height in pixels.
- Applies `imageSmoothingQuality = "high"` bilinear resize.
- No aspect-ratio lock in v1; the UI accepts independent W × H.

## Rotate
- Left / right 90° buttons in the toolbar.
- Rotation swaps dimensions for 90/270 cases.