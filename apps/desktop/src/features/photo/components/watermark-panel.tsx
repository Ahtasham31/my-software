import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider } from "@/components/ui/form";
import type { WatermarkOptions } from "../engine/watermark";

const POSITIONS: { id: WatermarkOptions["position"]; label: string }[] = [
  { id: "tl", label: "Top Left" },
  { id: "tr", label: "Top Right" },
  { id: "bl", label: "Bottom Left" },
  { id: "br", label: "Bottom Right" },
  { id: "center", label: "Center" },
  { id: "tile", label: "Tiled" }
];

interface Props {
  onApply: (opts: WatermarkOptions) => void;
  disabled: boolean;
}

export function WatermarkPanel({ onApply, disabled }: Props): JSX.Element {
  const [opts, setOpts] = useState<WatermarkOptions>({
    text: "DocuVerse",
    fontFamily: "Inter, sans-serif",
    fontSize: 48,
    color: "#ffffff",
    opacity: 0.4,
    rotation: -30,
    position: "br",
    margin: 40
  });

  return (
    <div className="space-y-3">
      <div>
        <Label>Text</Label>
        <Input value={opts.text} onChange={(e) => setOpts({ ...opts, text: e.target.value })} />
      </div>
      <div>
        <Label>Position</Label>
        <Select value={opts.position} onValueChange={(v) => setOpts({ ...opts, position: v as WatermarkOptions["position"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {POSITIONS.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Size: {opts.fontSize}px</Label>
        <Slider min={12} max={200} step={1} value={[opts.fontSize]} onValueChange={([v]) => v !== undefined && setOpts({ ...opts, fontSize: v })} />
      </div>
      <div>
        <Label>Opacity: {Math.round(opts.opacity * 100)}%</Label>
        <Slider min={0.05} max={1} step={0.05} value={[opts.opacity]} onValueChange={([v]) => v !== undefined && setOpts({ ...opts, opacity: v })} />
      </div>
      <div>
        <Label>Rotation: {opts.rotation}°</Label>
        <Slider min={-90} max={90} step={1} value={[opts.rotation]} onValueChange={([v]) => v !== undefined && setOpts({ ...opts, rotation: v })} />
      </div>
      <div>
        <Label>Color</Label>
        <Input type="color" value={opts.color} onChange={(e) => setOpts({ ...opts, color: e.target.value })} className="h-8 w-16 p-0" />
      </div>
      <Button size="sm" onClick={() => onApply(opts)} disabled={disabled} className="w-full">
        Apply Watermark
      </Button>
    </div>
  );
}