# Typography Guidelines

## Font Stack
- Sans: `Inter, ui-sans-serif, system-ui, ...`
- Urdu: `Noto Nastaliq Urdu, Jameel Noori Nastaleeq, serif`
- Mono: `JetBrains Mono, ui-monospace, monospace`

## Scale
| Token | Usage | Tailwind |
|---|---|---|
| Display | Hero titles | `text-display` (2.5rem / 700) |
| Title | Page headers | `text-title` (1.75rem / 600) |
| Section | Section headings | `text-section` (1.25rem / 600) |
| Card Heading | Card titles | `text-card-heading` (1rem / 600) |
| Body | Default | `text-sm` (14px) |
| Secondary | Helper text | `text-xs text-muted-foreground` |
| Code | Technical | `font-mono text-xs` |

## Rules
- Do not hardcode font sizes for headings; use the token classes.
- Urdu content automatically uses the `font-urdu` utility when explicitly set.
- Respect user interface scale (`--scale` variable) — do not use `!important`.