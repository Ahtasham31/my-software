# Accessibility Guidelines

## Keyboard
- All interactive controls focusable in DOM order.
- Visible focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- `Escape` closes dialogs, popovers, command palette.
- `Ctrl+K` / `⌘+K` opens the command palette.

## Semantics
- Landmarks: `<aside aria-label="Primary navigation">`, `<header>`, `<main>`, `<footer>`.
- Icon-only buttons have `aria-label` and a `TooltipContent` label.
- Dialogs use Radix primitives (automatic focus trap, `aria-modal`).

## Color & Contrast
- All built-in themes target WCAG AA for body text.
- "High Contrast Accessibility" theme exceeds 7:1 for key text.
- Status is never conveyed by color alone — icons or text accompany it.

## Motion
- Respect `prefers-reduced-motion` (see `globals.css`).
- Animations are short (≤150ms) and non-blocking.

## Scaling
- Interface scale is user-adjustable via `--scale`.
- Fonts use `rem`/`em`; no fixed pixel heights on text.

## Screen Readers
- Toasts use `aria-live="polite"`.
- Loading uses `role="status"`.
- Progress uses Radix `Progress` semantics.