import { invokeNative } from "./native";
import type { FileMetadata } from "@/types/models";

export const getFileMetadata = (path: string) =>
  invokeNative<FileMetadata>("fs_metadata", { path });

export const safeWriteFile = (path: string, data: Uint8Array) =>
  invokeNative<void>("fs_safe_write", { path, data: Array.from(data) });