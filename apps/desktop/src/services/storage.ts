import { invokeNative } from "./native";
import type { StoragePaths } from "@/types/models";

export const getStoragePaths = () => invokeNative<StoragePaths>("storage_paths");