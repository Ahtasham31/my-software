import { Button } from "@/components/ui/button";
import {  Label, Slider, Switch } from "@/components/ui/form";
import { PREPROCESS_PRESETS, type PreprocessOptions } from "@/types/ocr";
import { cn } from "@/lib/cn";

interface Props {
  options: PreprocessOptions;
  onChange: (o: PreprocessOptions) => void;
  onPreset: (id: string) => void;
  selectedPreset: string;
}

export function PreprocessPanel({
  options,
  onChange,
  onPreset,
  selectedPreset
}: Props): JSX.Element {
  const update = (patch: Partial<PreprocessOptions>) =>
    onChange({ ...options, ...patch });

  return (
    <div className="space-y-3">
      <div>
        <Label>Preset</Label>
        <div className="mt-1 grid grid-cols-2 gap-1">
          {PREPROCESS_PRESETS.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={selectedPreset === p.id ? "default" : "outline"}
              onClick={() => onPreset(p.id)}
              className="text-[11px]"
            >
              {p.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant={selectedPreset === "custom" ? "default" : "outline"}
            onClick={() => onPreset("custom")}
            className={cn("text-[11px] col-span-2")}
          >
            Custom
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <Label className="text-[11px]">Rotation</Label>
          <div className="mt-1 grid grid-cols-4 gap-1">
            {[0, 90, 180, 270].map((deg) => (
              <Button
                key={deg}
                size="sm"
                variant={options.rotateDegrees === deg ? "default" : "outline"}
                onClick={() => update({ rotateDegrees: deg === 0 ? null : deg })}
                className="text-[11px]"
              >
                {deg}°
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Grayscale</Label>
          <Switch
            checked={options.grayscale}
            onCheckedChange={(v) => update({ grayscale: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Invert</Label>
          <Switch
            checked={options.invert}
            onCheckedChange={(v) => update({ invert: v })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Threshold</Label>
            <span className="text-[10px] text-muted-foreground">
              {options.threshold ?? "off"}
            </span>
          </div>
          <Slider
            min={0}
            max={255}
            step={1}
            value={[options.threshold ?? 128]}
            onValueChange={([v]) => v !== undefined && update({ threshold: v })}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => update({ threshold: null })}
            className="mt-1 h-6 w-full text-[10px]"
          >
            Disable threshold
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Brightness</Label>
            <span className="text-[10px] text-muted-foreground">
              {options.brightness ?? 0}
            </span>
          </div>
          <Slider
            min={-100}
            max={100}
            step={1}
            value={[options.brightness ?? 0]}
            onValueChange={([v]) => v !== undefined && update({ brightness: v })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Contrast</Label>
            <span className="text-[10px] text-muted-foreground">
              {(options.contrast ?? 1).toFixed(2)}
            </span>
          </div>
          <Slider
            min={0.5}
            max={2}
            step={0.05}
            value={[options.contrast ?? 1]}
            onValueChange={([v]) => v !== undefined && update({ contrast: v })}
          />
        </div>
      </div>
    </div>
  );
}