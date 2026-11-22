import { invokeNative } from "./native";

export const openFileDialog = (multiple = false) =>
  invokeNative<string[]>("open_file_dialog", { multiple });

export const openDirectoryDialog = () =>
  invokeNative<string | null>("open_dir_dialog");

export const saveFileDialog = (
  defaultName?: string,
  filters?: string[][]
) =>
  invokeNative<string | null>("save_file_dialog", {
    defaultName: defaultName ?? null,
    filters: filters ?? null
  });