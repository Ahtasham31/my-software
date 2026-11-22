# Design System — DocuVerse Studio

## Goals
- Premium, coherent visual identity across 14 modules.
- Token-driven theming (12 built-in themes + custom).
- Accessible, keyboard-first, high-contrast safe.
- Lightweight; no heavy animation; supports reduced-motion.

## Layers
1. Tokens (semantic color slots, typography, radius, density, scale).
2. Themes (token packs + mode).
3. Primitives (ui/ components).
4. Layout (app shell, sidebar, header, status bar, page container).
5. Patterns (workspace templates, data components).
6. Feature pages (dashboard, settings).

## Tokens
Semantic slots only. Components never hardcode colors. Allowed slots:
primary, primaryForeground, secondary, secondaryForeground, accent,
accentForeground, background, foreground, card, cardForeground, popover,
popoverForeground, sidebar, sidebarForeground, header, headerForeground,
muted, mutedForeground, border, input, ring, hover, active, selection,
success, warning, error, information.

## Themes
- Built-in: Midnight Pro, Graphite Professional, Ocean Blue, Royal Purple,
  Emerald Studio, Arctic Light, Pure White, Warm Sand, Rose Quartz,
  Cyber Neon, Monochrome, High Contrast Accessibility.
- Modes: light, dark, system.
- Persistence: `docuverse.appearance.v1` in localStorage.

## Component Conventions
- Functional only — no decorative dead controls.
- `data-*` attributes for state; no reliance on color alone.
- Icon-only buttons always have `aria-label` + tooltip.
- Focus visible via `focus-visible:ring-*`.