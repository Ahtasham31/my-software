import { Button } from "@/components/ui/button";
import { Input, Label, Slider } from "@/components/ui/form";
import type { BrushKind, BrushOptions } from "@/types/photo";

const KINDS: { id: BrushKind; label: string }[] = [
  { id: "paint", label: "Paint" },
  { id: "eraser", label: "Eraser" },
  { id: "clone", label: "Clone Stamp" },
  { id: "heal", label: "Heal" },
  { id: "dodge", label: "Dodge" },
  { id: "burn", label: "Burn" },
  { id: "smudge", label: "Smudge" },
  { id: "blur", label: "Blur Brush" },
  { id: "red-eye", label: "Red-Eye" }
];

interface Props {
  options: BrushOptions;
  setOptions: (o: BrushOptions) => void;
  cloneSource: { x: number; y: number } | null;
  setCloneSource: (p: { x: number; y: number } | null) => void;
}

export function BrushOptionsPanel({ options, setOptions, cloneSource, setCloneSource }: Props): JSX.Element {
  const update = (patch: Partial<BrushOptions>) => setOptions({ ...options, ...patch });

  return (
    <div className="space-y-3">
      <div>
        <Label>Brush type</Label>
        <div className="grid grid-cols-3 gap-1 pt-1">
          {KINDS.map((k) => (
            <Button
              key={k.id}
              size="sm"
              variant={options.kind === k.id ? "default" : "outline"}
              onClick={() => update({ kind: k.id })}
              className="text-[11px]"
            >
              {k.label}
            </Button>
          ))}
        </div>
      </div>

      {(options.kind === "clone" || options.kind === "heal") && (
        <div className="rounded-md border border-border p-2 text-[11px]">
          <div className="font-medium">Clone source</div>
          {cloneSource ? (
            <div className="mt-1 flex items-center justify-between">
              <span>{Math.round(cloneSource.x)}, {Math.round(cloneSource.y)}</span>
              <Button size="sm" variant="ghost" onClick={() => setCloneSource(null)}>
                Clear
              </Button>
            </div>
          ) : (
            <p className="mt-1 text-muted-foreground">Alt+Click on the image to set source.</p>
          )}
        </div>
      )}

      <div>
        <Label>Size: {options.size}px</Label>
        <Slider
          min={2}
          max={300}
          step={1}
          value={[options.size]}
          onValueChange={([v]) => v !== undefined && update({ size: v })}
        />
      </div>

      <div>
        <Label>Hardness: {Math.round(options.hardness * 100)}%</Label>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[options.hardness]}
          onValueChange={([v]) => v !== undefined && update({ hardness: v })}
        />
      </div>

      <div>
        <Label>Opacity: {Math.round(options.opacity * 100)}%</Label>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[options.opacity]}
          onValueChange={([v]) => v !== undefined && update({ opacity: v })}
        />
      </div>

      <div>
        <Label>Flow: {Math.round(options.flow * 100)}%</Label>
        <Slider
          min={0.05}
          max={1}
          step={0.05}
          value={[options.flow]}
          onValueChange={([v]) => v !== undefined && update({ flow: v })}
        />
      </div>

      {(options.kind === "dodge" || options.kind === "burn" || options.kind === "smudge" || options.kind === "blur") && (
        <div>
          <Label>Strength: {Math.round(options.strength * 100)}%</Label>
          <Slider
            min={0.05}
            max={1}
            step={0.05}
            value={[options.strength]}
            onValueChange={([v]) => v !== undefined && update({ strength: v })}
          />
        </div>
      )}

      {(options.kind === "paint") && (
        <div>
          <Label>Color</Label>
          <Input
            type="color"
            value={options.color}
            onChange={(e) => update({ color: e.target.value })}
            className="h-8 w-16 p-0"
          />
        </div>
      )}
    </div>
  );
}