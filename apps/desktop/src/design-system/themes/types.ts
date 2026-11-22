import type { ThemeTokens } from "../tokens";

export type ThemeMode = "light" | "dark";

export interface Theme {
  id: string;
  name: string;
  mode: ThemeMode;
  description?: string;
  builtin: boolean;
  tokens: ThemeTokens;
  radius?: string;
}

export type AppearanceMode = "light" | "dark" | "system";
export type Density = "compact" | "comfortable" | "spacious";

export interface AppearanceSettings {
  themeId: string;
  mode: AppearanceMode;
  density: Density;
  scale: number;
  radius: number;
  customPrimary?: string;
  customAccent?: string;
}