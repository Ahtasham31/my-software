import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { AppearanceSettings, Density, Theme } from "./themes/types";
import { themeRegistry } from "./themes/registry";
import {
  applyDensity,
  applyMode,
  applyRadius,
  applyScale,
  applyThemeTokens
} from "./themes/applier";
import { DEFAULT_APPEARANCE } from "./theme-storage";
import { useSettings } from "@/providers/settings-provider";

export interface ThemeContextValue {
  appearance: AppearanceSettings;
  theme: Theme;
  themes: Theme[];
  setTheme: (id: string) => void;
  setMode: (mode: AppearanceSettings["mode"]) => void;
  setDensity: (density: Density) => void;
  setScale: (scale: number) => void;
  setRadius: (radius: number) => void;
  reset: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(id: string): Theme {
  return themeRegistry.get(id) ?? themeRegistry.get(DEFAULT_APPEARANCE.themeId)!;
}

function toAppearance(settings: ReturnType<typeof useSettings>): AppearanceSettings {
  if (!settings.settings) return DEFAULT_APPEARANCE;
  return settings.settings.appearance;
}

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const settings = useSettings();
  const [appearance, setAppearance] = useState<AppearanceSettings>(() =>
    toAppearance(settings)
  );
  const theme = resolveTheme(appearance.themeId);

  useEffect(() => {
    if (settings.settings) setAppearance(settings.settings.appearance);
  }, [settings.settings]);

  useEffect(() => {
    applyThemeTokens(theme.tokens);
    applyMode(appearance.mode);
    applyDensity(appearance.density);
    applyScale(appearance.scale);
    applyRadius(appearance.radius);
  }, [appearance, theme]);

  useEffect(() => {
    if (appearance.mode !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyMode("system");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [appearance.mode]);

  const persist = useCallback(
    (next: AppearanceSettings) => {
      setAppearance(next);
      void settings.updateAppearance(next);
    },
    [settings]
  );

  const setTheme = useCallback(
    (id: string) => persist({ ...appearance, themeId: id }),
    [appearance, persist]
  );
  const setMode = useCallback(
    (mode: AppearanceSettings["mode"]) => persist({ ...appearance, mode }),
    [appearance, persist]
  );
  const setDensity = useCallback(
    (density: Density) => persist({ ...appearance, density }),
    [appearance, persist]
  );
  const setScale = useCallback(
    (scale: number) => persist({ ...appearance, scale }),
    [appearance, persist]
  );
  const setRadius = useCallback(
    (radius: number) => persist({ ...appearance, radius }),
    [appearance, persist]
  );
  const reset = useCallback(() => {
    void settings.reset();
    setAppearance(DEFAULT_APPEARANCE);
  }, [settings]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      appearance,
      theme,
      themes: themeRegistry.list(),
      setTheme,
      setMode,
      setDensity,
      setScale,
      setRadius,
      reset
    }),
    [appearance, theme, setTheme, setMode, setDensity, setScale, setRadius, reset]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}