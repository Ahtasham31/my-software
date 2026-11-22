export type BatchOperation =
  | { kind: "resize"; width?: number; height?: number }
  | { kind: "convert"; format: string }
  | { kind: "grayscale" }
  | { kind: "brightness"; value: number }
  | { kind: "rotate"; degrees: number };

export interface BatchRecipe {
  operations: BatchOperation[];
  outputFormat?: string;
  outputDir: string;
}

export const DEFAULT_RECIPE: BatchRecipe = {
  operations: [],
  outputFormat: "png",
  outputDir: ""
};