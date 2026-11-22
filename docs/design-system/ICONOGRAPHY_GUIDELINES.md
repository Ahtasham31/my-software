# Iconography Guidelines

## Source
`lucide-react` only. No mixed icon libraries.

## Sizes
- Inline / buttons: `h-4 w-4`
- Nav sidebar: `h-4 w-4`
- Empty / feature: `h-8 w-8`
- Hero: `h-10 w-10`

## Stroke
Default Lucide stroke (2). Do not pass `strokeWidth` overrides except in
marketing/brand art.

## Accessibility
- Icon-only buttons MUST have `aria-label`.
- Wrap in `Tooltip` when the meaning is non-obvious.
- Decorative icons set `aria-hidden` (Lucide defaults are fine when paired with
  a label).

## Consistency
- Reuse icons from `NAV_CONFIG` for navigation.
- Use single icon per semantic concept (e.g., FileText for PDF, ScanLine for
  Scanner).