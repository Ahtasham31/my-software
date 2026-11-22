import { invokeNative } from "./native";

export interface DashboardPrefs {
  hiddenWidgets: string[];
  widgetOrder: string[];
}

export const getDashboardPrefs = () =>
  invokeNative<DashboardPrefs>("dashboard_prefs_get");

export const setDashboardPrefs = (prefs: DashboardPrefs) =>
  invokeNative<void>("dashboard_prefs_set", { prefs });