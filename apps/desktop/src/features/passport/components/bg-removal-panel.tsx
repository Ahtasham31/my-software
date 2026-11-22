import { Button } from "@/components/ui/button";
import { Label, Slider, Switch } from "@/components/ui/form";
import type { BgRemovalTool } from "@/types/passport";
import type { PassportStudioApi } from "../hooks/use-passport-studio";

interface Props {
  studio: PassportStudioApi;
}

export function BgRemovalPanel({ studio }: Props): JSX.Element {
  const { settings, setSettings } = studio;
  const bgRemoval = settings.backgroundRemoval;

  const updateRemoval = (patch: Partial<typeof bgRemoval>) => {
    setSettings({ ...settings, backgroundRemoval: { ...bgRemoval, ...patch } });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Background removal</Label>
        <Switch
          checked={bgRemoval.enabled}
          onCheckedChange={(v) => updateRemoval({ enabled: v })}
        />
      </div>

      <div>
        <Label className="text-[11px]">Tool</Label>
        <div className="mt-1 grid grid-cols-2 gap-1">
          {(["magic-wand", "brush-eraser"] as BgRemovalTool[]).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={studio.bgTool === t ? "default" : "outline"}
              onClick={() => studio.setBgTool(t)}
              className="text-[11px]"
            >
              {t === "magic-wand" ? "Magic Wand" : "Eraser Brush"}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-[11px]">Tolerance: {bgRemoval.tolerance}</Label>
        <Slider
          min={1}
          max={100}
          step={1}
          value={[bgRemoval.tolerance]}
          onValueChange={([v]) => v !== undefined && updateRemoval({ tolerance: v })}
        />
      </div>

      <div>
        <Label className="text-[11px]">Feather: {bgRemoval.feather}</Label>
        <Slider
          min={0}
          max={5}
          step={1}
          value={[bgRemoval.feather]}
          onValueChange={([v]) => v !== undefined && updateRemoval({ feather: v })}
        />
      </div>

      {studio.hasMask && (
        <div className="rounded-md border border-border p-2 text-[11px]">
          Mask active. Click Apply to refresh preview.
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={studio.clearMask}
          disabled={!studio.hasMask}
          className="flex-1"
        >
          Clear
        </Button>
        <Button
          size="sm"
          onClick={studio.applyMask}
          disabled={!studio.hasMask}
          className="flex-1"
        >
          Apply
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Click on background with the Magic Wand, or drag with the Eraser Brush to
        remove area. Then pick a new background from the Background tab.
      </p>
    </div>
  );
}