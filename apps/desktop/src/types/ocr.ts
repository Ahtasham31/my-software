export interface OcrEngineStatus {
  available: boolean;
  version: string | null;
  tesseractPath: string | null;
  popplerAvailable: boolean;
}

export interface LanguageInfo {
  code: string;
  name: string;
  installed: boolean;
}

export interface PreprocessOptions {
  rotateDegrees: number | null;
  grayscale: boolean;
  threshold: number | null;
  invert: boolean;
  brightness: number | null;
  contrast: number | null;
  deskew: boolean;
}

export const DEFAULT_PREPROCESS: PreprocessOptions = {
  rotateDegrees: null,
  grayscale: false,
  threshold: null,
  invert: false,
  brightness: null,
  contrast: null,
  deskew: false
};

export interface PreprocessPreset {
  id: string;
  label: string;
  options: PreprocessOptions;
}

export const PREPROCESS_PRESETS: PreprocessPreset[] = [
  {
    id: "standard",
    label: "Standard Document",
    options: { ...DEFAULT_PREPROCESS, grayscale: true }
  },
  {
    id: "low-quality",
    label: "Low-Quality Scan",
    options: { ...DEFAULT_PREPROCESS, grayscale: true, contrast: 1.3, threshold: 160 }
  },
  {
    id: "newspaper",
    label: "Newspaper",
    options: { ...DEFAULT_PREPROCESS, grayscale: true, threshold: 140 }
  },
  {
    id: "book",
    label: "Book Page",
    options: { ...DEFAULT_PREPROCESS, grayscale: true, brightness: 5, contrast: 1.1 }
  },
  {
    id: "urdu",
    label: "Urdu Document",
    options: { ...DEFAULT_PREPROCESS, grayscale: true, contrast: 1.15 }
  },
  {
    id: "arabic",
    label: "Arabic Document",
    options: { ...DEFAULT_PREPROCESS, grayscale: true, contrast: 1.15 }
  },
  {
    id: "receipt",
    label: "Receipt",
    options: { ...DEFAULT_PREPROCESS, grayscale: true, threshold: 170, contrast: 1.4 }
  },
  {
    id: "photo",
    label: "Photograph of Document",
    options: { ...DEFAULT_PREPROCESS, grayscale: true, brightness: 8, contrast: 1.2 }
  }
];

export interface RecognizeImageInput {
  sourcePath: string;
  language: string;
  preprocess: PreprocessOptions;
  psm?: number | null;
}

export interface RecognizeImageOutput {
  text: string;
  width: number;
  height: number;
  language: string;
  durationMs: number;
}

export interface ExtractedPage {
  page: number;
  text: string;
  hasText: boolean;
}

export interface ExtractPdfTextOutput {
  pages: ExtractedPage[];
  totalPages: number;
}

export type OcrJobKind =
  | "image-to-text"
  | "pdf-to-text"
  | "searchable-pdf"
  | "pdf-to-docx";

export type OcrJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface OcrJob {
  id: string;
  kind: OcrJobKind | string;
  sourcePath: string;
  outputPath: string | null;
  language: string;
  engine: string;
  status: OcrJobStatus | string;
  pageCount: number;
  durationMs: number | null;
  errorMessage: string | null;
  settingsJson: string | null;
  previewText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveOcrJobInput {
  kind: OcrJobKind | string;
  sourcePath: string;
  outputPath: string | null;
  language: string;
  status: OcrJobStatus | string;
  pageCount: number;
  durationMs: number | null;
  errorMessage: string | null;
  settingsJson: string | null;
  previewText: string | null;
}

export interface OcrSettings {
  defaultLanguage: string;
  defaultPreset: string;
  defaultPsm: number;
  defaultOutputFormat: "txt" | "docx" | "pdf";
  defaultExportFolder: string;
  confirmBeforeExport: boolean;
  performanceProfile: "low-ram" | "balanced" | "high-performance" | "custom";
  maxConcurrentJobs: number;
}

export const DEFAULT_OCR_SETTINGS: OcrSettings = {
  defaultLanguage: "eng",
  defaultPreset: "standard",
  defaultPsm: 3,
  defaultOutputFormat: "txt",
  defaultExportFolder: "",
  confirmBeforeExport: true,
  performanceProfile: "balanced",
  maxConcurrentJobs: 2
};

export interface WordConfidence {
  word: string;
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
}

export interface RecognizeImageTsvOutput {
  text: string;
  words: WordConfidence[];
  confidenceAvg: number;
  language: string;
  durationMs: number;
}

export interface PageOcrText {
  page: number;
  text: string;
}

export interface CreateSearchablePdfInput {
  sourcePdfPath: string;
  outputPath: string;
  pageTexts: PageOcrText[];
  dpi?: number | null;
}

export interface PdfToDocxInput {
  sourcePdfPath: string;
  outputPath: string;
  pages: PageOcrText[];
  rtl: boolean;
  fontFamily?: string | null;
  fontSize?: number | null;
}

export interface RecognizePdfPageInput {
  sourcePath: string;
  page: number;
  language: string;
  dpi?: number | null;
  preprocess: PreprocessOptions;
  psm?: number | null;
}

export interface InstallLanguageInput {
  sourceFilePath: string;
  languageCode: string;
}