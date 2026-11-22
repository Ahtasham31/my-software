import { Input, Label, Slider } from "@/components/ui/form";
import type { PassportSettings } from "@/types/passport";

interface Props {
  settings: PassportSettings;
  onChange: (s: PassportSettings) => void;
}

export function AdjustmentsPanel({ settings, onChange }: Props): JSX.Element {
  const update = (patch: Partial<PassportSettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="text-[10px] font-semibold uppercase text-muted-foreground">Position</div>
        <SliderRow
          label="Offset X"
          value={settings.offsetX}
          min={-500}
          max={500}
          step={1}
          onChange={(v) => update({ offsetX: v })}
        />
        <SliderRow
          label="Offset Y"
          value={settings.offsetY}
          min={-500}
          max={500}
          step={1}
          onChange={(v) => update({ offsetY: v })}
        />
        <SliderRow
          label="Scale"
          value={settings.scale}
          min={0.2}
          max={3}
          step={0.01}
          onChange={(v) => update({ scale: v })}
        />
        <SliderRow
          label="Rotation"
          value={settings.rotation}
          min={-45}
          max={45}
          step={0.5}
          onChange={(v) => update({ rotation: v })}
        />
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        <div className="text-[10px] font-semibold uppercase text-muted-foreground">Enhance</div>
        <SliderRow label="Brightness" value={settings.brightness} min={0.5} max={2} step={0.05} onChange={(v) => update({ brightness: v })} />
        <SliderRow label="Contrast" value={settings.contrast} min={0.5} max={2} step={0.05} onChange={(v) => update({ contrast: v })} />
        <SliderRow label="Exposure" value={settings.exposure} min={-1} max={1} step={0.05} onChange={(v) => update({ exposure: v })} />
        <SliderRow label="Saturation" value={settings.saturate} min={0} max={2} step={0.05} onChange={(v) => update({ saturate: v })} />
        <SliderRow label="Temperature" value={settings.temperature} min={-50} max={50} step={1} onChange={(v) => update({ temperature: v })} />
        <SliderRow label="Sharpness" value={settings.sharpness} min={0} max={1.5} step={0.05} onChange={(v) => update({ sharpness: v })} />
        <SliderRow label="Noise reduce" value={settings.noiseReduce} min={0} max={3} step={1} onChange={(v) => update({ noiseReduce: v })} />
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}): JSX.Element {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <Label className="text-[11px]">{label}</Label>
        <Input
          type="number"
          value={Number(value.toFixed(2))}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onChange(v);
          }}
          className="h-6 w-16 px-1 text-right text-[10px]"
        />
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => v !== undefined && onChange(v)}
      />
    </div>
  );
}