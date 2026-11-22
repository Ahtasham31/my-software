import { useEffect, useState } from "react";
import { FolderInput, FolderOpen, Play, X } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button, IconButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/display";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form";
import { useToast } from "@/components/ui/overlay";
import { openDirectoryDialog, openFileDialog } from "@/services/dialog";
import {
  checkEngine,
  listLanguages,
  preprocessPreview,
  recognizeImage,
  saveJob,
  saveText
} from "@/services/ocr";
import {
  PREPROCESS_PRESETS,
  type LanguageInfo,
  type PreprocessOptions
} from "@/types/ocr";

interface BatchResult {
  source: string;
  output: string | null;
  success: boolean;
  error: string | null;
}

export function BatchOcrPage(): JSX.Element {
  const toast = useToast();
  const [sources, setSources] = useState<string[]>([]);
  const [outputDir, setOutputDir] = useState("");
  const [language, setLanguage] = useState("eng");
  const [presetId, setPresetId] = useState("standard");
  const [preprocess, setPreprocess] = useState<PreprocessOptions>(
    PREPROCESS_PRESETS[0].options
  );
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState<BatchResult[]>([]);
  const [engineAvailable, setEngineAvailable] = useState(true);

  useEffect(() => {
    void (async () => {
      const e = await checkEngine();
      setEngineAvailable(e.available);
      setLanguages(await listLanguages());
    })();
  }, []);

  const pickSources = async () => {
    const files = await openFileDialog(true);
    if (files.length > 0) setSources((prev) => [...prev, ...files]);
  };

  const pickOutput = async () => {
    const dir = await openDirectoryDialog();
    if (dir) setOutputDir(dir);
  };

  const applyPreset = (id: string) => {
    setPresetId(id);
    const p = PREPROCESS_PRESETS.find((x) => x.id === id);
    if (p) setPreprocess(p.options);
  };

  const run = async () => {
    if (sources.length === 0 || !outputDir) return;
    setBusy(true);
    setResults([]);
    const newResults: BatchResult[] = [];
    const sep = outputDir.includes("\\") ? "\\" : "/";

    for (let i = 0; i < sources.length; i++) {
      const src = sources[i];
      setProgress(`Processing ${i + 1} / ${sources.length}…`);
      try {
        const r = await recognizeImage({
          sourcePath: src,
          language,
          preprocess,
          psm: 3
        });
        const baseName = src.split(/[\\/]/).pop()?.replace(/\.[^.]+$/, "") ?? "ocr";
        const outPath = `${outputDir}${sep}${baseName}.txt`;
        await saveText(outPath, r.text);
        await saveJob({
          kind: "image-to-text",
          sourcePath: src,
          outputPath: outPath,
          language,
          status: "completed",
          pageCount: 1,
          durationMs: r.durationMs,
          errorMessage: null,
          settingsJson: JSON.stringify({ preprocess }),
          previewText: r.text.slice(0, 200)
        });
        newResults.push({ source: src, output: outPath, success: true, error: null });
      } catch (e) {
        newResults.push({
          source: src,
          output: null,
          success: false,
          error: (e as { message?: string }).message ?? "unknown"
        });
      }
      setResults([...newResults]);
    }

    setBusy(false);
    setProgress("");
    toast.show({
      title: "Batch complete",
      description: `${newResults.filter((r) => r.success).length} ok, ${newResults.filter((r) => !r.success).length} failed`,
      variant: "success"
    });
  };

  void preprocessPreview;

  return (
    <PageContainer>
      <PageHeader
        title="Batch OCR"
        description="OCR multiple images at once and save results to a folder."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-card-heading">Source files ({sources.length})</h3>
            <Button size="sm" onClick={() => void pickSources()}>
              <FolderInput className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          {sources.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">
              No files added.
            </p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {sources.map((s) => (
                <li key={s} className="flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs">
                  <span className="flex-1 truncate">{s.split(/[\\/]/).pop()}</span>
                  <IconButton
                    aria-label="Remove"
                    onClick={() => setSources((prev) => prev.filter((p) => p !== s))}
                    className="h-5 w-5"
                  >
                    <X className="h-3 w-3" />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-card-heading">Settings</h3>
          <div className="space-y-3">
            <div>
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
            <div>
              <Label>Preprocess preset</Label>
              <Select value={presetId} onValueChange={applyPreset}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PREPROCESS_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Output folder</Label>
              <div className="flex gap-1">
                <Input value={outputDir} readOnly placeholder="Choose folder…" />
                <Button size="sm" variant="outline" onClick={() => void pickOutput()}>
                  <FolderOpen className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Button
              onClick={() => void run()}
              disabled={busy || sources.length === 0 || !outputDir || !engineAvailable}
              className="w-full"
            >
              <Play className="h-4 w-4" /> Run Batch OCR
            </Button>
          </div>
        </div>
      </div>

      {progress && (
        <div className="mt-3 rounded border border-border bg-card p-2 text-xs">{progress}</div>
      )}

      {results.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-card-heading">
            Results — <span className="text-success">{results.filter((r) => r.success).length} ok</span>,{" "}
            <span className="text-error">{results.filter((r) => !r.success).length} failed</span>
          </h3>
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {results.map((r) => (
              <li key={r.source} className="flex items-center gap-2 text-xs">
                <Badge variant={r.success ? "success" : "error"}>
                  {r.success ? "OK" : "ERR"}
                </Badge>
                <span className="flex-1 truncate">{r.source.split(/[\\/]/).pop()}</span>
                {r.error && <span className="text-error truncate">{r.error}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageContainer>
  );
}