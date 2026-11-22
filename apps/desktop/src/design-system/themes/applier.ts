import { tokenCssVar, type ThemeTokens } from "../tokens";

export function applyThemeTokens(tokens: ThemeTokens): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  (Object.keys(tokens) as Array<keyof ThemeTokens>).forEach((key) => {
    root.style.setProperty(tokenCssVar[key], tokens[key]);
  });
}

export function applyMode(mode: "light" | "dark" | "system"): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : mode;
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.mode = resolved;
}

export function applyDensity(density: "compact" | "comfortable" | "spacious"): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.density = density;
}

export function applyScale(scale: number): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--scale", String(scale));
}

export function applyRadius(radiusRem: number): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--radius", `${radiusRem}rem`);
}