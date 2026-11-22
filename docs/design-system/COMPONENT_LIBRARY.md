# Component Library

## Primitives (`components/ui`)
- button.tsx: `Button`, `IconButton` (variants: default/secondary/outline/ghost/destructive/link; sizes: sm/md/lg/icon).
- form.tsx: `Input`, `Textarea`, `Label`, `Select*`, `Checkbox`, `RadioGroup*`, `Switch`, `Slider`.
- display.tsx: `Badge`, `Separator`, `Skeleton`, `Spinner`, `Progress`, `Avatar*`, `Tooltip*`.
- overlay.tsx: `Dialog*`, `Popover*`, `DropdownMenu*`, `ToastProvider` + `useToast`, `ConfirmProvider` + `useConfirm`.
- card.tsx: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Panel`.
- tabs.tsx: `Tabs*`.
- scroll-area.tsx: `ScrollArea`.

## Layout (`components/layout`)
- `AppShell`, `Sidebar`, `Header`, `StatusBar`, `PageContainer`, `PageHeader`.

## Data (`components/data`)
- `EmptyState`, `LoadingState`, `ErrorState`.

## Navigation (`components/navigation`)
- `CommandPalette`.

## Rules
- All components accept `className` and merge via `cn()`.
- No functional logic in presentation primitives.
- Prefer `asChild` (Radix) for polymorphic triggers.
- No dead buttons — every interactive control either works or is disabled with
  a reason.