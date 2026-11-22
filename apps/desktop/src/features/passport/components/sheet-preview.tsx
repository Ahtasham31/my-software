import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider
} from "@/components/ui/form";
import { SHEET_LAYOUTS, type SheetLayoutId, type PassportPreset } from "@/types/passport";
import { computeSheetPlan, renderSheet } from "../engine/sheet-layout";
import { printCanvas } from "./print-button";

interface Props {
  preview: HTMLCanvasElement | null;
  preset: PassportPreset | undefined;
  onExport: (canvas: HTMLCanvasElement, label: string) => Promise<void>;
}

export function SheetPreview({ preview, preset, onExport }: Props): JSX.Element {
  const [layoutId, setLayoutId] = useState<SheetLayoutId>("4x6");
  const [marginMm, setMarginMm] = useState<number | null>(null);
  const [gapMm, setGapMm] = useState<number | null>(null);
  const [sheetCanvas, setSheetCanvas] = useState<HTMLCanvasElement | null>(null);

  const baseLayout = SHEET_LAYOUTS.find((l) => l.id === layoutId) ?? SHEET_LAYOUTS[0];
  const layout = {
    ...baseLayout,
    marginMm: marginMm ?? baseLayout.marginMm,
    gapMm: gapMm ?? baseLayout.gapMm
  };

  const generate = () => {
    if (!preview || !preset) return;
    const plan = computeSheetPlan(layout, preset.widthMm, preset.heightMm, preset.dpi);
    const sheet = renderSheet(preview, plan);
    setSheetCanvas(sheet);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-[11px]">Print sheet</Label>
        <Select value={layoutId} onValueChange={(v) => setLayoutId(v as SheetLayoutId)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {SHEET_LAYOUTS.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Margin</Label>
          <span className="text-[10px] text-muted-foreground">{layout.marginMm} mm</span>
        </div>
        <Slider
          min={0}
          max={20}
          step={0.5}
          value={[layout.marginMm]}
          onValueChange={([v]) => v !== undefined && setMarginMm(v)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Gap</Label>
          <span className="text-[10px] text-muted-foreground">{layout.gapMm} mm</span>
        </div>
        <Slider
          min={0}
          max={10}
          step={0.5}
          value={[layout.gapMm]}
          onValueChange={([v]) => v !== undefined && setGapMm(v)}
        />
      </div>

      <div className="rounded-md border border-border bg-muted/30 p-2 text-[10px] text-muted-foreground">
        <div>
          Sheet: {layout.widthMm}×{layout.heightMm} mm
        </div>
        {preview && preset && (
          <div>
            Photos per sheet:{" "}
            {computeSheetPlan(layout, preset.widthMm, preset.heightMm, preset.dpi).cells.length}
          </div>
        )}
      </div>

      <Button size="sm" variant="outline" onClick={generate} disabled={!preview} className="w-full">
        Generate Sheet
      </Button>

      {sheetCanvas && (
        <>
          <div className="rounded-md border border-border bg-white p-1">
            <canvas
              ref={(el) => {
                if (!el) return;
                el.width = sheetCanvas.width;
                el.height = sheetCanvas.height;
                const ctx = el.getContext("2d");
                if (ctx) {
                  ctx.clearRect(0, 0, el.width, el.height);
                  ctx.drawImage(sheetCanvas, 0, 0);
                }
              }}
              className="h-auto w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => printCanvas(sheetCanvas)}
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button
              size="sm"
              onClick={() => void onExport(sheetCanvas, `sheet_${layoutId}`)}
            >
              Export
            </Button>
          </div>
        </>
      )}
    </div>
  );
}