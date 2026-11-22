# Retouching Tools Guide

## Delivered in Phase 05
- Paint, Eraser, Clone Stamp, Heal, Dodge, Burn, Smudge, Blur Brush, Red-Eye.
- Each brush supports Size, Hardness, Opacity, Flow.
- Dodge/Burn/Smudge/Blur expose Strength.
- Clone and Heal require an Alt+Click to set the clone source first.
- Red-Eye is a manual darkening brush (traditional pixel operation, not
  automatic eye detection).
- Every stroke commits to the undo history on mouse-up.

## Implementation
- `engine/brush-tools.ts` — `paintDab` applies a single brush dab.
- Strokes are interpolated so fast movement doesn't produce gaps.
- Eraser uses `destination-out` compositing.
- Dodge/Burn use `screen`/`multiply` compositing with a radial gradient
  mask.
- Smudge samples the average color under the cursor.
- Clone/Heal copy a patch from `sourceCanvas` at the source coordinate
  offset by (source - cursor).
- Blur blurs the canvas and paints through an alpha mask.

## Not delivered (documented)
- Automatic red-eye detection.
- Automatic face-aware retouching.

Both are outside the "traditional, non-AI, user-controlled" scope as
documented in the spec; red-eye works via manual brush + clone.