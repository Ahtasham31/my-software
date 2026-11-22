import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  FileImage,
  FolderOpen,
  Maximize2,
  Printer,
  RotateCcw,
  Save,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/form";
import { useToast } from "@/components/ui/overlay";
import { usePassportStudio } from "./hooks/use-passport-studio";
import { PresetPanel } from "./components/preset-panel";
import { PassportCanvas } from "./components/passport-canvas";
import { AdjustmentsPanel } from "./components/adjustments-panel";
import { BackgroundPanel } from "./components/background-panel";
import { BgRemovalPanel } from "./components/bg-removal-panel";
import { SheetPreview } from "./components/sheet-preview";
import { ExportDialog } from "./components/export-dialog";
import { OpenProjectDialog } from "./components/open-project-dialog";
import { printCanvas } from "./components/print-button";
import { findPreset } from "./engine/presets";
import { presetToPx } from "@/types/passport";
import { GUIDE_META } from "./engine/guides";
import { listPresets, saveProject } from "@/services/passport";
import { cn } from "@/lib/cn";

export function PassportPage(): JSX.Element {
  const studio = usePassportStudio();
  const toast = useToast();
  const [showExport, setShowExport] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      try {
        const custom = await listPresets();
        if (custom.length > 0) {
          studio.setPresets([...studio.presets.filter((p) => !p.custom), ...custom]);
        }
      } catch {
        /* fallback to builtin */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preset = findPreset(studio.presets, studio.settings.presetId);
  const dims = preset ? presetToPx(preset) : { width: 0, height: 0 };

  const handleSaveProject = useCallback(async () => {
    try {
      await saveProject({
        name: studio.sourceName,
        sourcePath: studio.sourcePath,
        presetId: studio.settings.presetId,
        settingsJson: JSON.stringify(studio.settings),
        outputPath: null
      });
      toast.show({ title: "Project saved", variant: "success" });
    } catch (e) {
      toast.show({
        title: "Save failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    }
  }, [studio, toast]);

  const handlePrintSingle = useCallback(() => {
    if (!studio.preview) return;
    printCanvas(studio.preview);
  }, [studio.preview]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileAny = file as File & { path?: string };
    const path = fileAny.path;

    if (path) {
      try {
        await studio.importImageFromPath(path);
      } catch (err) {
        toast.show({
          title: "Import failed",
          description: (err as { message?: string }).message,
          variant: "error"
        });
      }
      return;
    }

    // Fallback: read via FileReader for browser environments
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Read failed"));
        reader.readAsDataURL(file);
      });
      void dataUrl;
      toast.show({
        title: "Drop not supported here",
        description: "Use Import button instead.",
        variant: "warning"
      });
    } catch {
      toast.show({ title: "Import failed", variant: "error" });
    }
  };

  return (
    <div
      ref={dropRef}
      className={cn(
        "flex h-[calc(100vh-3.5rem-1.75rem)] flex-col",
        dragOver && "ring-2 ring-primary ring-inset"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-1 border-b border-border bg-card px-2 py-1.5">
        <Button size="sm" variant="outline" onClick={() => void studio.importImage()}>
          <FolderOpen className="h-3.5 w-3.5" /> Import
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowOpen(true)}>
          <FileImage className="h-3.5 w-3.5" /> Open Recent
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => void handleSaveProject()}
          disabled={!studio.sourcePath}
        >
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
        <Button size="sm" variant="ghost" onClick={studio.fitToFrame}>
          <Maximize2 className="h-3.5 w-3.5" /> Fit
        </Button>
        <Button size="sm" variant="ghost" onClick={studio.resetAll}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          size="sm"
          variant={studio.showBeforeAfter ? "default" : "outline"}
          onClick={studio.toggleBeforeAfter}
          disabled={!studio.sourceOriginal}
        >
          A/B
        </Button>
        <div className="ml-auto" />
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrintSingle}
          disabled={!studio.preview}
        >
          <Printer className="h-3.5 w-3.5" /> Print
        </Button>
        <Button
          size="sm"
          onClick={() => setShowExport(true)}
          disabled={!studio.preview}
        >
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
      </div>

      {dragOver && (
        <div className="flex items-center justify-center gap-2 border-b border-primary bg-primary/10 py-2 text-xs text-primary">
          <Upload className="h-3.5 w-3.5" /> Drop image to import
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="w-64 flex-shrink-0">
          <PresetPanel
            presets={studio.presets}
            selectedId={studio.settings.presetId}
            onSelect={studio.selectPreset}
            onPresetsChange={async () => {
              try {
                const custom = await listPresets();
                studio.setPresets([...studio.presets.filter((p) => !p.custom), ...custom]);
              } catch {
                /* no-op */
              }
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          {studio.showBeforeAfter && studio.sourceOriginal ? (
            <div className="flex h-full items-center justify-center bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px]">
              <div className="max-h-full max-w-full">
                <canvas
                  ref={(el) => {
                    if (!el || !studio.sourceOriginal) return;
                    el.width = studio.sourceOriginal.width;
                    el.height = studio.sourceOriginal.height;
                    const ctx = el.getContext("2d");
                    if (ctx) {
                      ctx.clearRect(0, 0, el.width, el.height);
                      ctx.drawImage(studio.sourceOriginal, 0, 0);
                    }
                  }}
                  className="max-h-[80vh] w-auto object-contain"
                />
              </div>
            </div>
          ) : (
            <PassportCanvas studio={studio} />
          )}
        </div>

        <div className="w-80 flex-shrink-0 border-l border-border bg-card">
          <Tabs defaultValue="adjust" className="flex h-full flex-col">
            <TabsList className="m-2">
              <TabsTrigger value="adjust" className="flex-1">Adjust</TabsTrigger>
              <TabsTrigger value="bg" className="flex-1">BG</TabsTrigger>
              <TabsTrigger value="remove" className="flex-1">Remove</TabsTrigger>
              <TabsTrigger value="guides" className="flex-1">Guides</TabsTrigger>
              <TabsTrigger value="sheet" className="flex-1">Sheet</TabsTrigger>
            </TabsList>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <TabsContent value="adjust">
                <AdjustmentsPanel settings={studio.settings} onChange={studio.setSettings} />
              </TabsContent>
              <TabsContent value="bg">
                <BackgroundPanel settings={studio.settings} onChange={studio.setSettings} />
              </TabsContent>
              <TabsContent value="remove">
                <BgRemovalPanel studio={studio} />
              </TabsContent>
              <TabsContent value="guides">
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Positioning guides
                  </div>
                  {studio.settings.guides.map((g) => (
                    <div key={g.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: GUIDE_META[g.id].color }}
                        />
                        {GUIDE_META[g.id].label}
                      </span>
                      <Switch
                        checked={g.enabled}
                        onCheckedChange={() => studio.toggleGuide(g.id)}
                      />
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground">
                    Drag guides directly on the canvas. Visual helpers only — no
                    automatic face detection.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="sheet">
                <SheetPreview
                  preview={studio.preview}
                  preset={preset}
                  onExport={studio.exportSheet}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <div className="flex h-7 items-center gap-3 border-t border-border bg-card px-3 text-[11px] text-muted-foreground">
        <span>
          {preset ? preset.name : "No preset"} · {dims.width}×{dims.height}px @{" "}
          {preset?.dpi ?? 300} DPI
        </span>
        <span className="ml-auto truncate">{studio.sourceName}</span>
      </div>

      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        preview={studio.preview}
        defaultName={studio.sourceName.replace(/\.[^.]+$/, "")}
        widthPx={dims.width}
        heightPx={dims.height}
      />
      <OpenProjectDialog
        open={showOpen}
        onClose={() => setShowOpen(false)}
        onLoad={async (sourcePath, settingsJson) => {
          if (sourcePath) await studio.importImageFromPath(sourcePath);
          if (settingsJson) {
            try {
              studio.setSettings(JSON.parse(settingsJson));
            } catch {
              /* ignore invalid */
            }
          }
        }}
      />
    </div>
  );
}