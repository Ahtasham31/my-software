import { useCallback, useEffect, useState } from "react";
import { FolderOpen, Play, Save, Copy, Download } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@/components/ui/form";
import { Badge } from "@/components/ui/display";
import { useToast } from "@/components/ui/overlay";
import { openFileDialog, saveFileDialog } from "@/services/dialog";
import {
  checkEngine,
  createSearchablePdf,
  listLanguages,
  preprocessPreview,
  recognizeImage,
  recognizeImageTsv,
  saveDocx,
  saveJob,
  saveText
} from "@/services/ocr";
import {
  DEFAULT_PREPROCESS,
  PREPROCESS_PRESETS,
  type LanguageInfo,
  type PreprocessOptions,
  type WordConfidence
} from "@/types/ocr";
import { ImagePreview } from "./components/image-preview";
import { PreprocessPanel } from "./components/preprocess-panel";

const PSM_OPTIONS = [
  { value: 3, label: "Auto (3)" },
  { value: 6, label: "Single block (6)" },
  { value: 4, label: "Single column (4)" },
  { value: 11, label: "Sparse text (11)" }
];

export function ImageToTextPage(): JSX.Element {
  const toast = useToast();
  const [sourcePath, setSourcePath] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [showProcessed, setShowProcessed] = useState(false);
  const [preprocess, setPreprocess] = useState<PreprocessOptions>(DEFAULT_PREPROCESS);
  const [presetId, setPresetId] = useState("custom");
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [language, setLanguage] = useState("eng");
  const [psm, setPsm] = useState(3);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [engineAvailable, setEngineAvailable] = useState(true);

  useEffect(() => {
    void (async () => {
      const e = await checkEngine();
      setEngineAvailable(e.available);
      const langs = await listLanguages();
      setLanguages(langs);
      const installed = langs.find((l) => l.code === "eng" && l.installed);
      if (installed) setLanguage("eng");
    })();
  }, []);

  const pickImage = useCallback(async () => {
    const files = await openFileDialog(false);
    if (files.length === 0) return;
    const path = files[0];
    setSourcePath(path);
    const p = await preprocessPreview(path, DEFAULT_PREPROCESS);
    setPreview(p);
    setProcessedPreview(null);
    setShowProcessed(false);
    setText("");
  }, []);

  const refreshProcessed = useCallback(async () => {
    if (!sourcePath) return;
    const p = await preprocessPreview(sourcePath, preprocess);
    setProcessedPreview(p);
    setShowProcessed(true);
  }, [sourcePath, preprocess]);

  const applyPreset = (id: string) => {
    setPresetId(id);
    const preset = PREPROCESS_PRESETS.find((p) => p.id === id);
    if (preset) setPreprocess(preset.options);
  };

const run = async () => {
  if (!sourcePath) return;
  setBusy(true);
  try {
    const result = await recognizeImageTsv({
      sourcePath,
      language,
      preprocess,
      psm
    });
    setText(result.text);
    setWords(result.words);
    setConfidenceAvg(result.confidenceAvg);
    await saveJob({
      kind: "image-to-text",
      sourcePath,
      outputPath: null,
      language,
      status: "completed",
      pageCount: 1,
      durationMs: result.durationMs,
      errorMessage: null,
      settingsJson: JSON.stringify({ preprocess, psm }),
      previewText: result.text.slice(0, 200)
    });
    toast.show({ title: "OCR complete", variant: "success" });
  } catch (e) {
    toast.show({
      title: "OCR failed",
      description: (e as { message?: string }).message,
      variant: "error"
    });
  } finally {
    setBusy(false);
  }
};
const [words, setWords] = useState<WordConfidence[]>([]);
const [confidenceAvg, setConfidenceAvg] = useState<number>(0);
const [showConfidence, setShowConfidence] = useState(false);
  const handleSaveText = async () => {
    if (!text) return;
    const target = await saveFileDialog("ocr.txt", [["Text", "txt"]]);
    if (!target) return;
    try {
      await saveText(target, text);
      toast.show({ title: "Saved", variant: "success" });
    } catch (e) {
      toast.show({
        title: "Save failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    }
  };

  const handleSaveDocx = async () => {
    if (!text) return;
    const target = await saveFileDialog("ocr.docx", [["Word", "docx"]]);
    if (!target) return;
    try {
      const rtl = language === "urd" || language === "ara";
      await saveDocx(target, [text], rtl);
      toast.show({ title: "Saved", variant: "success" });
    } catch (e) {
      toast.show({
        title: "Save failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast.show({ title: "Copied", variant: "success" });
  };
  const handleSearchablePdf = async () => {
  if (!sourcePath || !text) return;
  const target = await saveFileDialog("searchable.pdf", [["PDF", "pdf"]]);
  if (!target) return;
  try {
    const { renderPdfPage } = await import("@/services/ocr");
    void renderPdfPage;
    toast.show({ title: "Searchable PDF", description: "Available for PDFs. Use PDF to Text tab.", variant: "warning" });
  } catch (e) {
    toast.show({
      title: "Failed",
      description: (e as { message?: string }).message,
      variant: "error"
    });
  }
};

  return (
    <PageContainer>
      <PageHeader
        title="Image to Text"
        description="Extract editable text from any image — fully offline."
      />

      {!engineAvailable && (
        <div className="mb-4 rounded border border-warning/40 bg-warning/10 p-3 text-sm">
          Tesseract is not installed. Install it and add to PATH to enable OCR.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          <div className="rounded-lg border border-border bg-card p-3">
            <Button size="sm" onClick={() => void pickImage()} className="w-full">
              <FolderOpen className="h-3.5 w-3.5" /> Choose Image
            </Button>
            {sourcePath && (
              <p className="mt-2 truncate text-xs text-muted-foreground">{sourcePath}</p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l.code} value={l.code} disabled={!l.installed}>
                      {l.name} {!l.installed && "(not installed)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-2">
              <Label>Page segmentation</Label>
              <Select value={String(psm)} onValueChange={(v) => setPsm(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PSM_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <PreprocessPanel
              options={preprocess}
              onChange={setPreprocess}
              onPreset={applyPreset}
              selectedPreset={presetId}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => void refreshProcessed()}
              disabled={!sourcePath}
              className="mt-2 w-full"
            >
              Preview processed
            </Button>
          </div>

          <Button
            onClick={() => void run()}
            disabled={!sourcePath || busy || !engineAvailable}
            className="w-full"
          >
            <Play className="h-4 w-4" /> {busy ? "Processing…" : "Run OCR"}
          </Button>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="h-64">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold">Original</span>
                <Badge variant="outline">source</Badge>
              </div>
              <ImagePreview src={preview} />
            </div>
            <div className="h-64">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold">Processed</span>
                <Switch
                  checked={showProcessed}
                  onCheckedChange={setShowProcessed}
                />
              </div>
              <ImagePreview src={showProcessed ? processedPreview : null} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-xs font-semibold">Extracted text</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => void handleCopy()} disabled={!text}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button size="sm" variant="outline" onClick={() => void handleSaveText()} disabled={!text}>
                  <Save className="h-3.5 w-3.5" /> TXT
                </Button>
                <Button size="sm" variant="outline" onClick={() => void handleSaveDocx()} disabled={!text}>
                  <Save className="h-3.5 w-3.5" /> DOCX
                </Button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-64 w-full resize-none bg-transparent p-3 font-mono text-sm focus:outline-none"
              placeholder="Recognized text will appear here…"
              dir={language === "urd" || language === "ara" ? "rtl" : "ltr"}
            />
          </div>
          {confidenceAvg > 0 && (
  <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-1.5 text-xs">
    <span className="text-muted-foreground">Avg confidence:</span>
    <span className={confidenceClass(confidenceAvg)}>
      {confidenceAvg.toFixed(1)}%
    </span>
    <Button size="sm" variant="ghost" onClick={() => setShowConfidence((v) => !v)} className="h-6 text-[10px]">
      {showConfidence ? "Hide words" : "Show words"}
    </Button>
  </div>
)}
{showConfidence && words.length > 0 && (
  <div className="max-h-32 overflow-y-auto border-b border-border p-2 text-xs">
    <div className="flex flex-wrap gap-1">
      {words.map((w, i) => (
        <span
          key={i}
          className={`rounded px-1 ${confidenceClass(w.confidence)}`}
          title={`${w.confidence.toFixed(0)}%`}
        >
          {w.word}
        </span>
      ))}
    </div>
  </div>
)}
        </div>
      </div>
    </PageContainer>
  );
}
function confidenceClass(conf: number): string {
  if (conf >= 80) return "text-success";
  if (conf >= 60) return "text-warning";
  return "text-error";
}