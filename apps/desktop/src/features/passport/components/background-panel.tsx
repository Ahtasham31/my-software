import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BACKGROUND_PRESETS, type PassportSettings, type CustomBackground } from "@/types/passport";
import { Button, IconButton } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/overlay";
import {
  deleteBackground,
  listBackgrounds,
  saveBackground
} from "@/services/passport";
import { customToPreset } from "../engine/background";

interface Props {
  settings: PassportSettings;
  onChange: (s: PassportSettings) => void;
}

export function BackgroundPanel({ settings, onChange }: Props): JSX.Element {
  const toast = useToast();
  const [customs, setCustoms] = useState<CustomBackground[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("Custom");
  const [kind, setKind] = useState<"solid" | "gradient">("solid");
  const [color1, setColor1] = useState("#60a5fa");
  const [color2, setColor2] = useState("#1e40af");

  const reload = async () => {
    try {
      const list = await listBackgrounds();
    setCustoms(list);
    (window as unknown as { __passportCustomBgs?: CustomBackground[] }).__passportCustomBgs = list;
    } catch {
      /* no-op */
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const selectPreset = (id: string) => onChange({ ...settings, bg: id });

  const handleSave = async () => {
    try {
      const saved = await saveBackground({
        name: name.trim() || "Custom",
        kind,
        color1,
        color2: kind === "gradient" ? color2 : null
      });
      setCustoms((prev) => [saved, ...prev]);
      setShowAdd(false);
      toast.show({ title: "Background saved", variant: "success" });
    } catch (e) {
      toast.show({
        title: "Save failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBackground(id);
      setCustoms((prev) => prev.filter((c) => c.id !== id));
      if (settings.bg === `custom:${id}`) {
        onChange({ ...settings, bg: "white" });
      }
    } catch (e) {
      toast.show({
        title: "Delete failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    }
  };

  const allCustomPresets = customs.map(customToPreset);

  return (
    <div className="space-y-3">
      <div>
        <Label>Background presets</Label>
        <div className="mt-1 grid grid-cols-4 gap-1">
          {BACKGROUND_PRESETS.map((b) => {
            const selected = settings.bg === b.id;
            const style =
              b.kind === "solid"
                ? { background: b.color }
                : b.kind === "gradient"
                ? { background: `linear-gradient(${b.color},${b.color2})` }
                : {
                    background: "repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%)",
                    backgroundSize: "10px 10px"
                  };
            return (
              <button
                key={b.id}
                onClick={() => selectPreset(b.id)}
                title={b.label}
                aria-label={b.label}
                className={cn(
                  "aspect-square rounded-md border-2",
                  selected ? "border-primary" : "border-border"
                )}
                style={style}
              />
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Custom backgrounds</Label>
          <IconButton
            aria-label="Add custom background"
            onClick={() => setShowAdd((v) => !v)}
            className="h-6 w-6"
          >
            <Plus className="h-3.5 w-3.5" />
          </IconButton>
        </div>

        {showAdd && (
          <div className="mt-2 space-y-2 rounded-md border border-border p-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="h-7"
            />
            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant={kind === "solid" ? "default" : "outline"}
                onClick={() => setKind("solid")}
                className="text-[11px]"
              >
                Solid
              </Button>
              <Button
                size="sm"
                variant={kind === "gradient" ? "default" : "outline"}
                onClick={() => setKind("gradient")}
                className="text-[11px]"
              >
                Gradient
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <Label className="text-[10px]">Color 1</Label>
                <Input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="h-7 w-full p-0"
                />
              </div>
              {kind === "gradient" && (
                <div>
                  <Label className="text-[10px]">Color 2</Label>
                  <Input
                    type="color"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="h-7 w-full p-0"
                  />
                </div>
              )}
            </div>
            <div
              className="h-8 rounded border border-border"
              style={
                kind === "solid"
                  ? { background: color1 }
                  : { background: `linear-gradient(${color1},${color2})` }
              }
            />
            <Button size="sm" onClick={() => void handleSave()} className="w-full">
              Save
            </Button>
          </div>
        )}

        {customs.length === 0 ? (
          <p className="mt-1 text-[10px] text-muted-foreground">
            Save your own solid or gradient backgrounds here.
          </p>
        ) : (
          <div className="mt-1 grid grid-cols-4 gap-1">
            {allCustomPresets.map((b) => {
              const customId = b.id.replace("custom:", "");
              const selected = settings.bg === b.id;
              const style =
                b.kind === "solid"
                  ? { background: b.color }
                  : { background: `linear-gradient(${b.color},${b.color2})` };
              return (
                <div key={b.id} className="relative">
                  <button
                    onClick={() => selectPreset(b.id)}
                    title={b.label}
                    aria-label={b.label}
                    className={cn(
                      "aspect-square w-full rounded-md border-2",
                      selected ? "border-primary" : "border-border"
                    )}
                    style={style}
                  />
                  <button
                    onClick={() => void handleDelete(customId)}
                    aria-label="Delete background"
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-white"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <Label className="text-[11px]">Custom color</Label>
        <Input
          type="color"
          className="h-7 w-full p-0"
          value={
            BACKGROUND_PRESETS.find((b) => b.id === settings.bg)?.color ??
            allCustomPresets.find((b) => b.id === settings.bg)?.color ??
            "#ffffff"
          }
          onChange={(e) => onChange({ ...settings, bg: `custom:${e.target.value}` })}
        />
      </div>

      <p className="text-[10px] text-muted-foreground">
        Backgrounds are drawn behind the photo. Use Remove tab for background removal of the source image.
      </p>
    </div>
  );
}