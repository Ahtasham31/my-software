export interface LoadedImage {
  path: string;
  name: string;
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
  dataUrl: string;
}

export type PhotoTool =
  | "select"
  | "crop"
  | "magic-wand"
  | "pan"
  | "rect-select"
  | "ellipse-select"
  | "lasso"
  | "brush";

export type BrushKind =
  | "paint"
  | "eraser"
  | "clone"
  | "heal"
  | "dodge"
  | "burn"
  | "smudge"
  | "blur"
  | "red-eye";

export interface BrushOptions {
  kind: BrushKind;
  size: number;
  hardness: number;
  opacity: number;
  flow: number;
  color: string;
  strength: number;
}

export const DEFAULT_BRUSH: BrushOptions = {
  kind: "paint",
  size: 40,
  hardness: 0.7,
  opacity: 1,
  flow: 1,
  color: "#ff3366",
  strength: 0.5
};

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturate: number;
  hue: number;
  exposure: number;
  temperature: number;
  blur: number;
  grayscale: number;
  sepia: number;
  invert: number;
  vibrance: number;
  gamma: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 1,
  contrast: 1,
  saturate: 1,
  hue: 0,
  exposure: 0,
  temperature: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  vibrance: 0,
  gamma: 1,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0
};

export const ADJUSTMENT_META: Record<
  keyof Adjustments,
  { label: string; min: number; max: number; step: number; default: number; group: string }
> = {
  brightness: { label: "Brightness", min: 0, max: 3, step: 0.05, default: 1, group: "Basic" },
  contrast: { label: "Contrast", min: 0, max: 3, step: 0.05, default: 1, group: "Basic" },
  saturate: { label: "Saturation", min: 0, max: 3, step: 0.05, default: 1, group: "Basic" },
  hue: { label: "Hue", min: -180, max: 180, step: 1, default: 0, group: "Basic" },
  exposure: { label: "Exposure", min: -2, max: 2, step: 0.1, default: 0, group: "Tone" },
  temperature: { label: "Temperature", min: -100, max: 100, step: 1, default: 0, group: "Tone" },
  gamma: { label: "Gamma", min: 0.1, max: 3, step: 0.05, default: 1, group: "Tone" },
  highlights: { label: "Highlights", min: -1, max: 1, step: 0.05, default: 0, group: "Tone" },
  shadows: { label: "Shadows", min: -1, max: 1, step: 0.05, default: 0, group: "Tone" },
  whites: { label: "Whites", min: -1, max: 1, step: 0.05, default: 0, group: "Tone" },
  blacks: { label: "Blacks", min: -1, max: 1, step: 0.05, default: 0, group: "Tone" },
  vibrance: { label: "Vibrance", min: -1, max: 1, step: 0.05, default: 0, group: "Color" },
  blur: { label: "Blur", min: 0, max: 20, step: 0.5, default: 0, group: "Effect" },
  grayscale: { label: "Grayscale", min: 0, max: 1, step: 0.05, default: 0, group: "Effect" },
  sepia: { label: "Sepia", min: 0, max: 1, step: 0.05, default: 0, group: "Effect" },
  invert: { label: "Invert", min: 0, max: 1, step: 0.05, default: 0, group: "Effect" }
};

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HistoryEntry {
  name: string;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export type FilterId =
  | "grayscale"
  | "sepia"
  | "invert"
  | "blur"
  | "sharpen"
  | "vintage"
  | "warm"
  | "cool"
  | "median"
  | "unsharp"
  | "auto-levels";

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: "grayscale", label: "Grayscale" },
  { id: "sepia", label: "Sepia" },
  { id: "invert", label: "Invert" },
  { id: "blur", label: "Blur" },
  { id: "sharpen", label: "Sharpen" },
  { id: "median", label: "Noise Reduce" },
  { id: "unsharp", label: "Unsharp Mask" },
  { id: "auto-levels", label: "Auto Levels" },
  { id: "vintage", label: "Vintage" },
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" }
];