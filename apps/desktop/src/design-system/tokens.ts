export type TokenKey =
  | "primary" | "primaryForeground"
  | "secondary" | "secondaryForeground"
  | "accent" | "accentForeground"
  | "background" | "foreground"
  | "card" | "cardForeground"
  | "popover" | "popoverForeground"
  | "sidebar" | "sidebarForeground"
  | "header" | "headerForeground"
  | "muted" | "mutedForeground"
  | "border" | "input" | "ring"
  | "hover" | "active" | "selection"
  | "success" | "warning" | "error" | "information";

export const tokenCssVar: Record<TokenKey, string> = {
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  sidebar: "--sidebar",
  sidebarForeground: "--sidebar-foreground",
  header: "--header",
  headerForeground: "--header-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  hover: "--hover",
  active: "--active",
  selection: "--selection",
  success: "--success",
  warning: "--warning",
  error: "--error",
  information: "--information"
};

export type ThemeTokens = Record<TokenKey, string>;