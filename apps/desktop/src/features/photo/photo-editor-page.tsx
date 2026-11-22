import { useState } from "react";
import { FileImage, Keyboard, Save } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button, IconButton } from "@/components/ui/button";
import { usePhotoEditor } from "./hooks/use-photo-editor";
import { useLayers } from "./hooks/use-layers";
import { usePhotoShortcuts } from "./hooks/use-photo-shortcuts";
import { useBrushTool } from "./hooks/use-brush-tool";
import { PhotoCanvas } from "./components/photo-canvas";
import { PhotoToolbar } from "./components/photo-toolbar";
import { PhotoToolsPanel } from "./components/photo-tools-panel";
import { PhotoPropertiesPanel } from "./photo-properties-panel-extended";
import { LayersPanel } from "./components/layers-panel";
import { BeforeAfterView } from "./components/before-after-view";
import { ShortcutPanel } from "./components/shortcut-panel";
import { ProjectSaveDialog } from "./components/project-save-dialog";
import { ProjectOpenDialog } from "./components/project-open-dialog";
import { renderLayers } from "./engine/layer-renderer";
import { cloneCanvas } from "./engine/image-engine";
import type { Layer } from "@/types/photo-layers";

export function PhotoEditorPage(): JSX.Element {
  const editor = usePhotoEditor();
  const layersApi = useLayers();
  const brush = useBrushTool(editor.canvas, editor.commit);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [originalCanvas, setOriginalCanvas] = useState<HTMLCanvasElement | null>(null);
  usePhotoShortcuts(editor);

  const flattened =
    layersApi.layers.length > 0 && editor.canvas
      ? renderLayers(layersApi.layers, editor.canvas.width, editor.canvas.height)
      : editor.canvas;

  const handleOpenImage = async () => {
    await editor.openImage();
    if (editor.canvas) {
      setOriginalCanvas(cloneCanvas(editor.canvas));
    }
  };

  const handleLoadedProject = async (
    project: { sourcePath: string | null },
    layers: Layer[]
  ) => {
    if (project.sourcePath) {
      await editor.loadImageFromPath(project.sourcePath);
      if (editor.canvas) setOriginalCanvas(cloneCanvas(editor.canvas));
    }
    layersApi.replaceAll(layers);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem-1.75rem)] flex-col">
      <div className="flex items-center gap-1 border-b border-border bg-card px-2 py-1.5">
        <PhotoToolbar editor={editor} onOpenImage={handleOpenImage} />
        <div className="mx-1 h-5 w-px bg-border" />
        <Button size="sm" variant="outline" onClick={() => setShowOpen(true)}>
          <FileImage className="h-3.5 w-3.5" /> Open Project
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowSave(true)}
          disabled={!editor.canvas}
        >
          <Save className="h-3.5 w-3.5" /> Save Project
        </Button>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <PhotoToolsPanel editor={editor} />
        <div className="min-w-0 flex-1">
          {!editor.canvas ? (
            <PageContainer>
              <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
                <h2 className="mb-2 text-title">Photo Editing Studio</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Open a JPG, PNG, WebP, BMP or TIFF image. All processing is local.
                </p>
                <Button onClick={() => void handleOpenImage()}>Open Image</Button>
              </div>
            </PageContainer>
          ) : showBeforeAfter && originalCanvas ? (
            <BeforeAfterView
              original={originalCanvas}
              edited={flattened ?? editor.canvas}
              visible={showBeforeAfter}
            />
          ) : (
            <PhotoCanvas
              editor={{ ...editor, canvas: flattened ?? editor.canvas }}
              brush={brush}
            />
          )}
        </div>
        <div className="flex w-80 flex-shrink-0 flex-col border-l border-border">
          <div className="min-h-0 flex-1">
            <PhotoPropertiesPanel editor={editor} brush={brush} />
          </div>
          <div className="h-64">
            <LayersPanel layersApi={layersApi} />
          </div>
        </div>

        <div className="absolute right-4 top-2 flex gap-1">
          <IconButton
            aria-label="Before/After"
            onClick={() => setShowBeforeAfter((v) => !v)}
            className={showBeforeAfter ? "bg-active/15" : ""}
          >
            <span className="text-[10px] font-bold">A/B</span>
          </IconButton>
          <IconButton aria-label="Shortcuts" onClick={() => setShowShortcuts((v) => !v)}>
            <Keyboard className="h-4 w-4" />
          </IconButton>
        </div>
        {showShortcuts && <ShortcutPanel onClose={() => setShowShortcuts(false)} />}
      </div>

      <div className="flex h-7 items-center gap-3 border-t border-border bg-card px-3 text-[11px] text-muted-foreground">
        <span>{editor.width} × {editor.height}px</span>
        <span>Tool: {editor.tool}</span>
        <span>Zoom: {Math.round(editor.zoom * 100)}%</span>
        <span>Layers: {layersApi.layers.length}</span>
        <span className="ml-auto truncate">{editor.name}</span>
      </div>

      <ProjectSaveDialog
        open={showSave}
        onClose={() => setShowSave(false)}
        onSaved={() => undefined}
        layers={layersApi.layers}
        width={editor.width}
        height={editor.height}
        format={editor.name.split(".").pop() ?? "png"}
        sourcePath={editor.sourcePath}
        defaultName={editor.name}
      />
      <ProjectOpenDialog
        open={showOpen}
        onClose={() => setShowOpen(false)}
        onLoaded={handleLoadedProject}
      />
    </div>
  );
}