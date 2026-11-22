import { invokeNative } from "./native";
import type { PassportPreset, PresetInput } from "@/types/passport";

export interface PassportProject {
  id: string;
  name: string;
  sourcePath: string | null;
  presetId: string | null;
  settingsJson: string | null;
  outputPath: string | null;
  createdAt: string;
  updatedAt: string;
}

export const listPresets = () =>
  invokeNative<PassportPreset[]>("passport_presets_list");

export const savePreset = (input: PresetInput) =>
  invokeNative<PassportPreset>("passport_preset_save", { input });

export const deletePreset = (id: string) =>
  invokeNative<void>("passport_preset_delete", { id });

export const listProjects = () =>
  invokeNative<PassportProject[]>("passport_projects_list");

export const saveProject = (input: {
  name: string;
  sourcePath: string | null;
  presetId: string | null;
  settingsJson: string | null;
  outputPath: string | null;
}) => invokeNative<PassportProject>("passport_project_save", { input });

export const saveDataUrl = (path: string, dataUrl: string) =>
  invokeNative<string>("passport_save_data_url", { input: { path, dataUrl } });


import type { CustomBackground, SaveBackgroundInput } from "@/types/passport";

export const listBackgrounds = () =>
  invokeNative<CustomBackground[]>("passport_backgrounds_list");

export const saveBackground = (input: SaveBackgroundInput) =>
  invokeNative<CustomBackground>("passport_background_save", { input });

export const deleteBackground = (id: string) =>
  invokeNative<void>("passport_background_delete", { id });