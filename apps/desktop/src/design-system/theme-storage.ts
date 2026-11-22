import type { AppearanceSettings } from "./themes/types";

const KEY = "docuverse.appearance.v1";

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  themeId: "midnight-pro",
  mode: "dark",
  density: "comfortable",
  scale: 1,
  radius: 0.75,
};

export function loadAppearance(): AppearanceSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    const parsed = JSON.parse(raw) as Partial<AppearanceSettings>;
    return { ...DEFAULT_APPEARANCE, ...parsed };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function saveAppearance(settings: AppearanceSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* no-op: localStorage may be unavailable */
  }
}