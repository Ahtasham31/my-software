import { invokeNative } from "./native";
import type {
  ExtractPdfTextOutput,
  LanguageInfo,
  OcrEngineStatus,
  OcrJob,
  PreprocessOptions,
  RecognizeImageInput,
  RecognizeImageOutput,
  SaveOcrJobInput
} from "@/types/ocr";

export const checkEngine = () =>
  invokeNative<OcrEngineStatus>("ocr_check_engine");

export const listLanguages = () =>
  invokeNative<LanguageInfo[]>("ocr_list_languages");

export const preprocessPreview = (sourcePath: string, preprocess: PreprocessOptions) =>
  invokeNative<string>("ocr_preprocess_preview", { sourcePath, preprocess });

export const recognizeImage = (input: RecognizeImageInput) =>
  invokeNative<RecognizeImageOutput>("ocr_recognize_image", { input });

export const extractPdfText = (
  sourcePath: string,
  pageStart?: number | null,
  pageEnd?: number | null
) =>
  invokeNative<ExtractPdfTextOutput>("ocr_extract_pdf_text", {
    input: { sourcePath, pageStart: pageStart ?? null, pageEnd: pageEnd ?? null }
  });

export const renderPdfPage = (sourcePath: string, page: number, dpi = 200) =>
  invokeNative<string>("ocr_render_pdf_page", {
    input: { sourcePath, page, dpi }
  });

export const saveText = (path: string, text: string) =>
  invokeNative<string>("ocr_save_text", { input: { path, text } });

export const saveDocx = (
  path: string,
  pages: string[],
  rtl: boolean,
  fontFamily = "Arial",
  fontSize = 24
) =>
  invokeNative<string>("ocr_save_docx", {
    input: { path, pages, rtl, fontFamily, fontSize }
  });

export const saveJob = (input: SaveOcrJobInput) =>
  invokeNative<OcrJob>("ocr_job_save", { input });

export const listJobs = (limit?: number) =>
  invokeNative<OcrJob[]>("ocr_jobs_list", { limit: limit ?? null });

export const deleteJob = (id: string) =>
  invokeNative<void>("ocr_job_delete", { id });

export const clearJobs = () => invokeNative<void>("ocr_jobs_clear");



import type {
  CreateSearchablePdfInput,
  InstallLanguageInput,
  PdfToDocxInput,
  RecognizeImageTsvOutput,
  RecognizePdfPageInput
} from "@/types/ocr";

export const recognizeImageTsv = (input: {
  sourcePath: string;
  language: string;
  preprocess: PreprocessOptions;
  psm?: number | null;
}) =>
  invokeNative<RecognizeImageTsvOutput>("ocr_recognize_image_tsv", {
    input: { ...input, psm: input.psm ?? null }
  });

export const recognizePdfPage = (input: RecognizePdfPageInput) =>
  invokeNative<RecognizeImageTsvOutput>("ocr_recognize_pdf_page", { input });

export const createSearchablePdf = (input: CreateSearchablePdfInput) =>
  invokeNative<string>("ocr_create_searchable_pdf", { input });

export const pdfToDocx = (input: PdfToDocxInput) =>
  invokeNative<string>("ocr_pdf_to_docx", { input });

export const installLanguagePack = (input: InstallLanguageInput) =>
  invokeNative<void>("ocr_install_language_pack", { input });

export const getLanguagePackInfo = () =>
  invokeNative<string>("ocr_language_pack_info");