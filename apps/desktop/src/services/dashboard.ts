import { invokeNative } from "./native";
import type { DashboardSummary } from "@/types/models";

export const getDashboardSummary = () =>
  invokeNative<DashboardSummary>("dashboard_summary");