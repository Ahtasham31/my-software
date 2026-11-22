export type PresetCategory =
  | "identity"
  | "visa"
  | "id-card"
  | "custom";

export type MeasurementUnit = "mm" | "cm" | "in" | "px";

export interface PassportPreset {
  id: string;
  name: string;
  category: PresetCategory;
  widthMm: number;
  heightMm: number;
  dpi: number;
  aspectRatio: string | null;
  backgroundPreference: string | null;
  custom: boolean;
  createdAt: string;
}

export interface PresetInput {
  name: string;
  category: PresetCategory;
  widthMm: number;
  heightMm: number;
  dpi: number;
  aspectRatio?: string | null;
  backgroundPreference?: string | null;
}

export type GuideId =
  | "headTop"
  | "eyeLine"
  | "chin"
  | "shoulder"
  | "faceCenter"
  | "safeMargin";

export interface GuideState {
  id: GuideId;
  enabled: boolean;
  position: number;
}

export const DEFAULT_GUIDES: GuideState[] = [
  { id: "headTop", enabled: true, position: 0.08 },
  { id: "eyeLine", enabled: true, position: 0.42 },
  { id: "chin", enabled: true, position: 0.78 },
  { id: "shoulder", enabled: true, position: 0.92 },
  { id: "faceCenter", enabled: true, position: 0.5 },
  { id: "safeMargin", enabled: true, position: 0.05 }
];

export type SheetLayoutId = "4x6" | "A4" | "A5" | "custom";

export interface SheetLayout {
  id: SheetLayoutId;
  label: string;
  widthMm: number;
  heightMm: number;
  marginMm: number;
  gapMm: number;
}

export const SHEET_LAYOUTS: SheetLayout[] = [
  { id: "4x6", label: "4 × 6 in", widthMm: 101.6, heightMm: 152.4, marginMm: 3, gapMm: 2 },
  { id: "A4", label: "A4", widthMm: 210, heightMm: 297, marginMm: 5, gapMm: 3 },
  { id: "A5", label: "A5", widthMm: 148, heightMm: 210, marginMm: 4, gapMm: 2 },
  { id: "custom", label: "Custom", widthMm: 100, heightMm: 150, marginMm: 3, gapMm: 2 }
];

export interface BackgroundPreset {
  id: string;
  label: string;
  kind: "solid" | "gradient" | "transparent";
  color?: string;
  color2?: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: "white", label: "White", kind: "solid", color: "#ffffff" },
  { id: "light-grey", label: "Light Grey", kind: "solid", color: "#e6e6e6" },
  { id: "blue", label: "Blue", kind: "solid", color: "#1e40af" },
  { id: "light-blue", label: "Light Blue", kind: "solid", color: "#60a5fa" },
  { id: "red", label: "Red", kind: "solid", color: "#dc2626" },
  { id: "light-red", label: "Light Red", kind: "solid", color: "#fca5a5" },
  {
    id: "blue-gradient",
    label: "Blue Gradient",
    kind: "gradient",
    color: "#1e3a8a",
    color2: "#3b82f6"
  },
  {
    id: "grey-gradient",
    label: "Grey Gradient",
    kind: "gradient",
    color: "#6b7280",
    color2: "#d1d5db"
  },
  { id: "transparent", label: "Transparent", kind: "transparent" }
];

export interface PassportSettings {
  presetId: string;
  bg: string;
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
  guides: GuideState[];
  brightness: number;
  contrast: number;
  exposure: number;
  saturate: number;
  temperature: number;
  sharpness: number;
  noiseReduce: number;
  feather: number;
  backgroundRemoval: {
    enabled: boolean;
    tolerance: number;
    feather: number;
  };
}

export const DEFAULT_SETTINGS: PassportSettings = {
  presetId: "",
  bg: "white",
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotation: 0,
  guides: DEFAULT_GUIDES,
  brightness: 1,
  contrast: 1,
  exposure: 0,
  saturate: 1,
  temperature: 0,
  sharpness: 0,
  noiseReduce: 0,
  feather: 0,
  backgroundRemoval: { enabled: false, tolerance: 25, feather: 1 }
};
export function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

export function presetToPx(preset: PassportPreset): { width: number; height: number } {
  return {
    width: mmToPx(preset.widthMm, preset.dpi),
    height: mmToPx(preset.heightMm, preset.dpi)
  };
}
export type BgRemovalTool = "magic-wand" | "brush-eraser";

export interface CustomBackground {
  id: string;
  name: string;
  kind: "solid" | "gradient";
  color1: string;
  color2: string | null;
  createdAt: string;
}

export interface SaveBackgroundInput {
  name: string;
  kind: "solid" | "gradient";
  color1: string;
  color2?: string | null;
}