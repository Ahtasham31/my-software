import { useCallback, useEffect, useState } from "react";
import { Download, FileText, FolderOpen, Play, Save } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/form";
import { Badge } from "@/components/ui/display";
import { useToast } from "@/components/ui/overlay";
import { openFileDialog, saveFileDialog } from "@/services/dialog";
import {
  checkEngine,
  createSearchablePdf,
  extractPdfText,
  listLanguages,
  pdfToDocx,
  recognizePdfPage,
  saveJob,
  saveText
} from "@/services/ocr";
import {
  DEFAULT_PREPROCESS,
  type ExtractedPage,
  type LanguageInfo
} from "@/types/ocr";

export function PdfToTextPage(): JSX.Element {
  const toast = useToast();
  const [sourcePath, setSourcePath] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pages, setPages] = useState<ExtractedPage[]>([]);
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [language, setLanguage] = useState("eng");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [engineAvailable, setEngineAvailable] = useState(true);
  const [popplerAvailable, setPopplerAvailable] = useState(false);

  useEffect(() => {
    void (async () => {
      const e = await checkEngine();
      setEngineAvailable(e.available);
      setPopplerAvailable(e.popplerAvailable);
      setLanguages(await listLanguages());
    })();
  }, []);

  const pickPdf = useCallback(async () => {
    const files = await openFileDialog(false);
    if (files.length === 0) return;
    setSourcePath(files[0]);
    setPages([]);
    setTotalPages(0);
  }, []);

  const extract = async () => {
    if (!sourcePath) return;
    setBusy(true);
    setProgress("Extracting text…");
    try {
      const r = await extractPdfText(sourcePath);
      setTotalPages(r.totalPages);
      setPages(r.pages);
      toast.show({ title: "Extracted", variant: "success" });
    } catch (e) {
      toast.show({
        title: "Extract failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const runOcrFallback = async () => {
    if (!sourcePath || !popplerAvailable || !engineAvailable) return;
    setBusy(true);
    const updated = [...pages];
    const newPages: ExtractedPage[] = [];
    try {
      for (let i = 0; i < updated.length; i++) {
        const p = updated[i];
        if (p.hasText) {
          newPages.push(p);
          continue;
        }
        setProgress(`OCR page ${p.page} / ${totalPages}…`);
        try {
          const r = await recognizePdfPage({
            sourcePath,
            page: p.page,
            language,
            dpi: 200,
            preprocess: DEFAULT_PREPROCESS,
            psm: 3
          });
          newPages.push({ ...p, text: r.text, hasText: true });
        } catch (e) {
          newPages.push({
            ...p,
            text: `[OCR failed: ${(e as { message?: string }).message ?? "unknown"}]`,
            hasText: false
          });
        }
        setPages([...newPages]);
      }
      await saveJob({
        kind: "pdf-to-text",
        sourcePath,
        outputPath: null,
        language,
        status: "completed",
        pageCount: newPages.length,
        durationMs: null,
        errorMessage: null,
        settingsJson: null,
        previewText: newPages[0]?.text.slice(0, 200) ?? null
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
      setProgress("");
    }
  };

  const joinedText = pages.map((p) => p.text).join("\n\n--- Page break ---\n\n");

  const handleSaveTxt = async () => {
    if (!joinedText) return;
    const target = await saveFileDialog("pdf-text.txt", [["Text", "txt"]]);
    if (!target) return;
    try {
      await saveText(target, joinedText);
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
    if (pages.length === 0 || !sourcePath) return;
    const target = await saveFileDialog("pdf-text.docx", [["Word", "docx"]]);
    if (!target) return;
    try {
      await pdfToDocx({
        sourcePdfPath: sourcePath,
        outputPath: target,
        pages: pages.map((p) => ({ page: p.page, text: p.text })),
        rtl: language === "urd" || language === "ara",
        fontFamily: "Arial",
        fontSize: 24
      });
      toast.show({ title: "Saved DOCX", variant: "success" });
    } catch (e) {
      toast.show({
        title: "Save failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    }
  };

  const handleSearchablePdf = async () => {
    if (!sourcePath || pages.length === 0 || !popplerAvailable) return;
    const missing = pages.filter((p) => !p.hasText);
    if (missing.length > 0) {
      toast.show({
        title: "OCR required",
        description: `${missing.length} page(s) need OCR first. Run OCR fallback.`,
        variant: "warning"
      });
      return;
    }
    const target = await saveFileDialog("searchable.pdf", [["PDF", "pdf"]]);
    if (!target) return;
    setBusy(true);
    try {
      await createSearchablePdf({
        sourcePdfPath: sourcePath,
        outputPath: target,
        pageTexts: pages.map((p) => ({ page: p.page, text: p.text })),
        dpi: 150
      });
      await saveJob({
        kind: "searchable-pdf",
        sourcePath,
        outputPath: target,
        language,
        status: "completed",
        pageCount: pages.length,
        durationMs: null,
        errorMessage: null,
        settingsJson: null,
        previewText: null
      });
      toast.show({ title: "Searchable PDF saved", variant: "success" });
    } catch (e) {
      toast.show({
        title: "Failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  const missingCount = pages.filter((p) => !p.hasText).length;

  return (
    <PageContainer>
      <PageHeader
        title="PDF to Text"
        description="Extract selectable text, run OCR on scanned pages, or export DOCX / searchable PDF."
      />

      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <Button size="sm" onClick={() => void pickPdf()} className="w-full">
            <FolderOpen className="h-3.5 w-3.5" /> Choose PDF
          </Button>
          {sourcePath && (
            <p className="mt-2 truncate text-xs text-muted-foreground">{sourcePath}</p>
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <Label>Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {languages.map((l) => (
                <SelectItem key={l.code} value={l.code} disabled={!l.installed}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 flex flex-col justify-end">
          <Button onClick={() => void extract()} disabled={!sourcePath || busy}>
            <FileText className="h-4 w-4" /> Extract text
          </Button>
        </div>
      </div>

      {progress && (
        <div className="mb-3 rounded border border-border bg-card p-2 text-xs">
          {progress}
        </div>
      )}

      {missingCount > 0 && (
        <div className="mb-3 rounded border border-warning/40 bg-warning/10 p-3 text-sm">
          <span>{missingCount} page(s) have no selectable text.</span>
          <Button
            size="sm"
            onClick={() => void runOcrFallback()}
            disabled={busy || !popplerAvailable || !engineAvailable}
            className="ml-2"
          >
            <Play className="h-3.5 w-3.5" /> Run OCR fallback
          </Button>
          {!popplerAvailable && (
            <span className="ml-2 text-error">Poppler not installed.</span>
          )}
          {!engineAvailable && (
            <span className="ml-2 text-error">Tesseract not installed.</span>
          )}
        </div>
      )}

      {pages.length > 0 && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {pages.length} / {totalPages} pages
              </Badge>
              {missingCount > 0 && (
                <Badge variant="warning">{missingCount} need OCR</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => void handleSaveTxt()}>
                <Save className="h-3.5 w-3.5" /> TXT
              </Button>
              <Button size="sm" variant="outline" onClick={() => void handleSaveDocx()}>
                <Save className="h-3.5 w-3.5" /> DOCX
              </Button>
              <Button
                size="sm"
                onClick={() => void handleSearchablePdf()}
                disabled={missingCount > 0 || !popplerAvailable}
              >
                <Download className="h-3.5 w-3.5" /> Searchable PDF
              </Button>
            </div>
          </div>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {pages.map((p) => (
              <div key={p.page} className="rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-xs">
                  <span className="font-semibold">Page {p.page}</span>
                  <Badge variant={p.hasText ? "success" : "warning"}>
                    {p.hasText ? "text" : "no text"}
                  </Badge>
                </div>
                <pre className="whitespace-pre-wrap p-3 font-mono text-xs">
                  {p.text || "(no text extracted)"}
                </pre>
              </div>
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}