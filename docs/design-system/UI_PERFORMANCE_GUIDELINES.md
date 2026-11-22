# UI Performance Guidelines

## Budgets (targets, not guarantees)
- Initial JS bundle ≤ 350 KB (gzipped) for shell.
- Theme switch ≤ 16 ms on mid-range hardware.
- Sidebar collapse ≤ 200 ms with `prefers-reduced-motion` respected.

## Practices
- Lazy-load module routes in future phases.
- No animation on layout-critical properties; animate only `transform`/`opacity`.
- Virtualize any list over 100 items when the feature ships.
- Avoid full-resolution images for thumbnails; use generated thumbnails.
- Debounce/guard high-frequency inputs (search, resize).
- Cleanup: all `window.addEventListener` paired with `removeEventListener` in
  `useEffect` returns.
- No global state for transient UI; use local state and lift only when needed.
- Theme provider computes tokens once per appearance change.

## Diagnostics (future)
- Performance panel will show memory, CPU, active jobs, cache size.