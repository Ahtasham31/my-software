
### `docs/design-system/COLOR_TOKEN_REFERENCE.md`
```markdown
# Color Token Reference

All tokens are HSL triplets (e.g. `222 47% 6%`) stored in CSS variables and
consumed via Tailwind `hsl(var(--token))`.

| Token | CSS Variable | Tailwind Class |
|---|---|---|
| primary | `--primary` | `bg-primary`, `text-primary` |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` |
| secondary | `--secondary` | `bg-secondary` |
| secondaryForeground | `--secondary-foreground` | `text-secondary-foreground` |
| accent | `--accent` | `bg-accent` |
| accentForeground | `--accent-foreground` | `text-accent-foreground` |
| background | `--background` | `bg-background` |
| foreground | `--foreground` | `text-foreground` |
| card / cardForeground | `--card` / `--card-foreground` | `bg-card`, `text-card-foreground` |
| popover / popoverForeground | `--popover` / `--popover-foreground` | `bg-popover` |
| sidebar / sidebarForeground | `--sidebar` / `--sidebar-foreground` | `bg-sidebar` |
| header / headerForeground | `--header` / `--header-foreground` | `bg-header` |
| muted / mutedForeground | `--muted` / `--muted-foreground` | `bg-muted`, `text-muted-foreground` |
| border, input, ring | `--border`, `--input`, `--ring` | `border-border`, `ring-ring` |
| hover, active, selection | `--hover`, `--active`, `--selection` | `bg-hover`, `bg-active`, `bg-selection` |
| success, warning, error, information | `--success`, `--warning`, `--error`, `--information` | `text-success`, `bg-warning/10`, … |