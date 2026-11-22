import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input, Label, Slider } from "@/components/ui/form";
import { FILTERS, ADJUSTMENT_META } from "@/types/photo";
import type { Adjustments, BrushOptions } from "@/types/photo";
import type { PhotoEditorApi } from "./hooks/use-photo-editor";
import { BrushOptionsPanel } from "./components/brush-options-panel";
import { WatermarkPanel } from "./components/watermark-panel";

interface BrushApi {
  options: BrushOptions;
  setOptions: (o: BrushOptions) => void;
  cloneSource: { x: number; y: number } | null;
  setCloneSource: (p: { x: number; y: number } | null) => void;
}

export function PhotoPropertiesPanel({ editor, brush }: { editor: PhotoEditorApi; brush: BrushApi }): JSX.Element {
  return (
    <div className="h-full w-full overflow-y-auto border-l border-border bg-card p-3">
      <Tabs defaultValue="adjust">
        <TabsList className="w-full">
          <TabsTrigger value="adjust" className="flex-1">Adjust</TabsTrigger>
          <TabsTrigger value="filters" className="flex-1">Filters</TabsTrigger>
          <TabsTrigger value="tools" className="flex-1">Tools</TabsTrigger>
          <TabsTrigger value="brush" className="flex-1">Brush</TabsTrigger>
          <TabsTrigger value="mark" className="flex-1">Mark</TabsTrigger>
        </TabsList>

        <TabsContent value="adjust"><AdjustmentsTab editor={editor} /></TabsContent>
        <TabsContent value="filters"><FiltersTab editor={editor} /></TabsContent>
        <TabsContent value="tools"><ToolsTab editor={editor} /></TabsContent>
        <TabsContent value="brush">
          <BrushOptionsPanel
            options={brush.options}
            setOptions={brush.setOptions}
            cloneSource={brush.cloneSource}
            setCloneSource={brush.setCloneSource}
          />
        </TabsContent>
        <TabsContent value="mark">
          <WatermarkPanel onApply={editor.applyWatermark} disabled={!editor.canvas} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdjustmentsTab({ editor }: { editor: PhotoEditorApi }): JSX.Element {
  const groups = Array.from(new Set(Object.values(ADJUSTMENT_META).map((m) => m.group)));
  const update = (key: keyof Adjustments, value: number) =>
    editor.setAdjustments({ ...editor.adjustments, [key]: value });

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group} className="space-y-2">
          <div className="text-[10px] font-semibold uppercase text-muted-foreground">{group}</div>
          {(Object.keys(ADJUSTMENT_META) as (keyof Adjustments)[])
            .filter((k) => ADJUSTMENT_META[k].group === group)
            .map((key) => {
              const meta = ADJUSTMENT_META[key];
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between">
                    <Label>{meta.label}</Label>
                    <span className="text-[10px] text-muted-foreground">{editor.adjustments[key]}</span>
                  </div>
                  <Slider
                    min={meta.min}
                    max={meta.max}
                    step={meta.step}
                    value={[editor.adjustments[key]]}
                    onValueChange={([v]) => v !== undefined && update(key, v)}
                  />
                </div>
              );
            })}
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <Button size="sm" variant="outline" onClick={editor.resetAdjustments} className="flex-1">Reset</Button>
        <Button size="sm" onClick={editor.applyAdjustments} disabled={!editor.canvas} className="flex-1">Apply</Button>
      </div>
    </div>
  );
}

function FiltersTab({ editor }: { editor: PhotoEditorApi }): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FILTERS.map((f) => (
        <Button
          key={f.id}
          size="sm"
          variant="outline"
          onClick={() => editor.applyFilter(f.id)}
          disabled={!editor.canvas}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}

function ToolsTab({ editor }: { editor: PhotoEditorApi }): JSX.Element {
  const [fillColor, setFillColor] = useState("#ffffff");
  const [resizeW, setResizeW] = useState(editor.width);
  const [resizeH, setResizeH] = useState(editor.height);

  return (
    <div className="space-y-4">
      {editor.tool === "crop" && (
        <div className="space-y-2">
          <div className="text-xs font-medium">Crop</div>
          <div className="flex gap-2">
            <Button size="sm" onClick={editor.applyCrop} disabled={!editor.cropRect || editor.cropRect.w < 1} className="flex-1">Apply</Button>
            <Button size="sm" variant="outline" onClick={editor.cancelCrop} className="flex-1">Cancel</Button>
          </div>
        </div>
      )}

      {editor.tool === "magic-wand" && (
        <div className="space-y-2">
          <div className="text-xs font-medium">Magic Wand</div>
          <div>
            <Label>Tolerance</Label>
            <Slider min={1} max={100} step={1} value={[editor.tolerance]} onValueChange={([v]) => v !== undefined && editor.setTolerance(v)} />
          </div>
        </div>
      )}

      {editor.selectionMask && (
        <div className="space-y-2 border-t border-border pt-3">
          <div className="text-xs font-medium">Selection</div>
          <Button size="sm" onClick={editor.applySelectionTransparent} className="w-full">Make Transparent</Button>
          <div className="flex items-center gap-1">
            <Input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="h-8 w-12 p-0" />
            <Button size="sm" variant="outline" onClick={() => editor.applySelectionFill(fillColor)} className="flex-1">Fill</Button>
          </div>
          <Button size="sm" variant="ghost" onClick={editor.clearSelection} className="w-full">Clear</Button>
        </div>
      )}

      <div className="space-y-2 border-t border-border pt-3">
        <div className="text-xs font-medium">Resize</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Width</Label>
            <Input type="number" value={resizeW} onChange={(e) => setResizeW(parseInt(e.target.value, 10) || 1)} />
          </div>
          <div>
            <Label>Height</Label>
            <Input type="number" value={resizeH} onChange={(e) => setResizeH(parseInt(e.target.value, 10) || 1)} />
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => editor.resize(resizeW, resizeH)} disabled={!editor.canvas} className="w-full">Apply Resize</Button>
      </div>
    </div>
  );
}