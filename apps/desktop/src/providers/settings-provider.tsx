import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { getSettings, resetSettings, saveSettings } from "@/services/settings";
import type { AppSettings, AppearanceSettings } from "@/types/models";
import { DEFAULT_APPEARANCE } from "@/design-system/theme-storage";

interface SettingsContextValue {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  updateSettings: (next: AppSettings) => Promise<void>;
  updateAppearance: (appearance: AppearanceSettings) => Promise<void>;
  reset: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const DEFAULT_SETTINGS: AppSettings = {
  appearance: {
    themeId: DEFAULT_APPEARANCE.themeId,
    mode: DEFAULT_APPEARANCE.mode,
    density: DEFAULT_APPEARANCE.density,
    scale: DEFAULT_APPEARANCE.scale,
    radius: DEFAULT_APPEARANCE.radius
  },
  general: { language: "en", fontFamily: "Inter", autosaveIntervalSecs: 60 },
  performance: { profile: "balanced", cacheLimitMb: 256, backgroundConcurrency: 2 }
};

export function SettingsProvider({ children }: { children: ReactNode }): JSX.Element {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getSettings();
      setSettings(s);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message ?? "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const updateSettings = useCallback(async (next: AppSettings) => {
    await saveSettings(next);
    setSettings(next);
  }, []);

  const updateAppearance = useCallback(
    async (appearance: AppearanceSettings) => {
      const current = settings ?? DEFAULT_SETTINGS;
      const next: AppSettings = { ...current, appearance };
      await updateSettings(next);
    },
    [settings, updateSettings]
  );

  const reset = useCallback(async () => {
    const s = await resetSettings();
    setSettings(s);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      loading,
      error,
      reload,
      updateSettings,
      updateAppearance,
      reset
    }),
    [settings, loading, error, reload, updateSettings, updateAppearance, reset]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}