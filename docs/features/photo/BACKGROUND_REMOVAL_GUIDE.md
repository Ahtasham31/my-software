# Background Removal Guide

## Method A — Magic wand (color similarity)
1. Click Magic Wand tool.
2. Click on the background.
3. Adjust tolerance slider.
4. Click "Make Selection Transparent" or "Fill Selection".

## Method B — Rect / Ellipse / Lasso selection
- Rectangle: drag a box.
- Ellipse: drag a box; mask becomes an inscribed ellipse.
- Lasso: freehand click and drag around a region.

After a mask exists:
- Make transparent, or fill with a color.

## Limitations
- Magic wand is contiguous flood-fill only (no global color match yet).
- Feathering is implemented in `featherMask` but not yet exposed in UI.
- Complex hair/fur edges will not remove cleanly — documented in UI text.