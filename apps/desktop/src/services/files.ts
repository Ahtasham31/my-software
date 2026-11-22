import { invokeNative } from "./native";
import type { DirListing } from "@/types/models";

export const browseDirectory = (path: string) =>
  invokeNative<DirListing>("fs_browse", { path });

export const createFolder = (parent: string, name: string) =>
  invokeNative<string>("fs_create_folder", { parent, name });

export const importFile = (source: string, destinationDir: string) =>
  invokeNative<string>("fs_import_file", { source, destinationDir });

export const renamePath = (path: string, newName: string) =>
  invokeNative<string>("fs_rename_path", { path, newName });

export const deletePath = (path: string) =>
  invokeNative<void>("fs_delete_path", { path });

export const revealInOS = (path: string) =>
  invokeNative<void>("fs_reveal_in_os", { path });