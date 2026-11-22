import { invokeNative } from "./native";
import type { AppSettings } from "@/types/models";

export const getSettings = () => invokeNative<AppSettings>("settings_get");

export const saveSettings = (settings: AppSettings) =>
  invokeNative<void>("settings_set", { settings });

export const resetSettings = () => invokeNative<AppSettings>("settings_reset");