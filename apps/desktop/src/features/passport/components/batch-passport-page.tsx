import { useCallback, useState } from "react";
import { FolderInput, FolderOpen, Play, X } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button, IconButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/display";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form";
import { EmptyState } from "@/components/data/states";
import { useToast } from "@/components/ui/overlay";
import { openFileDialog, openDirectoryDialog } from "@/services/dialog";
import { loadPhotoImage } from "@/services/photo";
import { saveDataUrl } from "@/services/passport";
import { BUILTIN_PRESETS, findPreset } from "../engine/presets";
import { BACKGROUND_PRESETS, presetToPx, type PassportPreset } from "@/types/passport";
import { makeBackground } from "../engine/background";
import { builtinPresets } from "../engine/presets";

interface BatchResult {
  source: string;
  output: string | null;
  success: boolean;
  error: string | null;
}

export function BatchPassportPage(): JSX.Element {
  const toast = useToast();
  const [presets] = useState<PassportPreset[]>(builtinPresets());
  const [sources, setSources] = useState<string[]>([]);
  const [outputDir, setOutputDir] = useState("");
  const [presetId, setPresetId] = useState("passport-35x45");
  const [bg, setBg] = useState("white");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);

  const pickSources = useCallback(async () => {
    const files = await openFileDialog(true);
    if (files.length > 0) setSources((prev) => [...prev, ...files]);
  }, []);

  const pickOutputDir = useCallback(async () => {
    const dir = await openDirectoryDialog();
    if (dir) setOutputDir(dir);
  }, []);

  const run = useCallback(async () => {
    if (sources.length === 0 || !outputDir) return;
    const preset = findPreset(presets, presetId);
    if (!preset) return;
    setBusy(true);
    setResults([]);
    const dims = presetToPx(preset);
    const bgPreset = BACKGROUND_PRESETS.find((b) => b.id === bg) ?? BACKGROUND_PRESETS[0];

    const newResults: BatchResult[] = [];

    for (const srcPath of sources) {
      try {
        const loaded = await loadPhotoImage(srcPath);
        const img = new Image();
        img.src = loaded.dataUrl;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("decode failed"));
        });

        const out = document.createElement("canvas");
        out.width = dims.width;
        out.height = dims.height;
        const ctx = out.getContext("2d");
        if (!ctx) throw new Error("ctx null");

        const bgCanvas = makeBackground(dims.width, dims.height, bgPreset);
        ctx.drawImage(bgCanvas, 0, 0);

        const scaleToFill = Math.max(dims.width / img.naturalWidth, dims.height / img.naturalHeight);
        const drawW = img.naturalWidth * scaleToFill;
        const drawH = img.naturalHeight * scaleToFill;

        ctx.drawImage(
          img,
          (dims.width - drawW) / 2,
          (dims.height - drawH) / 2,
          drawW,
          drawH
        );

        const dataUrl = out.toDataURL("image/png");
        const baseName = srcPath.split(/[\\/]/).pop()?.replace(/\.[^.]+$/, "") ?? "output";
        const sep = outputDir.includes("\\") ? "\\" : "/";
        const targetPath = `${outputDir}${sep}${baseName}_passport.png`;

        await saveDataUrl(targetPath, dataUrl);

        newResults.push({
          source: srcPath,
          output: targetPath,
          success: true,
          error: null
        });
      } catch (e) {
        newResults.push({
          source: srcPath,
          output: null,
          success: false,
          error: (e as { message?: string }).message ?? "unknown"
        });
      }
    }

    setResults(newResults);
    setBusy(false);
    toast.show({
      title: `Batch complete`,
      description: `${newResults.filter((r) => r.success).length} ok, ${newResults.filter((r) => !r.success).length} failed`,
      variant: "success"
    });
  }, [sources, outputDir, presets, presetId, bg, toast]);

  void BUILTIN_PRESETS;

  return (
    <PageContainer>
      <PageHeader
        title="Batch Passport Generation"
        description="Generate passport photos for multiple images at once."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-card-heading">Source files ({sources.length})</h3>
            <Button size="sm" onClick={() => void pickSources()}>
              <FolderInput className="h-3.5 w-3.5" /> Add files
            </Button>
          </div>
          {sources.length === 0 ? (
            <EmptyState title="No files added" description="Add images to process." />
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
              <Label>Preset</Label>
              <Select value={presetId} onValueChange={setPresetId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {presets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.widthMm}×{p.heightMm} mm)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Background</Label>
              <Select value={bg} onValueChange={setBg}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BACKGROUND_PRESETS.filter((b) => b.kind !== "transparent").map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Output folder</Label>
              <div className="flex gap-1">
                <Input value={outputDir} readOnly placeholder="Choose folder…" />
                <Button size="sm" variant="outline" onClick={() => void pickOutputDir()}>
                  <FolderOpen className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Button
              onClick={() => void run()}
              disabled={busy || sources.length === 0 || !outputDir}
              className="w-full"
            >
              <Play className="h-4 w-4" /> Generate All
            </Button>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-card-heading">
            Results —{" "}
            <span className="text-success">{results.filter((r) => r.success).length} ok</span>,{" "}
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