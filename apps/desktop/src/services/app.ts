import { invokeNative } from "./native";
import type { AppInfo } from "@/types/models";

export const getAppInfo = () => invokeNative<AppInfo>("get_app_info");