import { invokeNative } from "./native";
import type { ActivityEntry, RecentItem, TrackRecentInput } from "@/types/models";

export const trackRecent = (input: TrackRecentInput) =>
  invokeNative<void>("recent_track", { input });

export const listRecent = (limit?: number) =>
  invokeNative<RecentItem[]>("recent_list", { limit });

export const clearRecent = () => invokeNative<void>("recent_clear");

export const listActivity = (limit?: number) =>
  invokeNative<ActivityEntry[]>("activity_list", { limit });