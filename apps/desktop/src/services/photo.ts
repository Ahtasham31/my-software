import { invokeNative } from "./native";
import type { LoadedImage } from "@/types/photo";

export const loadPhotoImage = (path: string) =>
  invokeNative<LoadedImage>("photo_load_image", { path });

export const savePhotoImage = (path: string, dataUrl: string) =>
  invokeNative<string>("photo_save_image", { input: { path, dataUrl } });

export const saveFileDialog = (
  defaultName?: string,
  filters?: string[][]
) =>
  invokeNative<string | null>("save_file_dialog", {
    defaultName: defaultName ?? null,
    filters: filters ?? null
  });