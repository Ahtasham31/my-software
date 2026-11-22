import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Trash2,
  Type,
  Square,
  Image as ImageIcon
} from "lucide-react";
import { IconButton } from "@/components/ui/button";
import { Input, Slider } from "@/components/ui/form";
import type { BlendMode } from "@/types/photo-layers";
import type { useLayers } from "../hooks/use-layers";

type LayersApi = ReturnType<typeof useLayers>;

const BLEND_MODES: BlendMode[] = ["normal", "multiply", "screen", "overlay", "darken", "lighten"];

export function LayersPanel({ layersApi }: { layersApi: LayersApi }): JSX.Element {
  const { layers, selectedId, selected } = layersApi;

  return (
    <div className="flex h-full flex-col border-t border-border">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1">
        <span className="text-xs font-semibold">Layers</span>
        <div className="ml-auto flex items-center gap-1">
          <IconButton aria-label="Add text" onClick={() => layersApi.addTextLayer()} className="h-7 w-7">
            <Type className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton aria-label="Add shape" onClick={() => layersApi.addShapeLayer()} className="h-7 w-7">
            <Square className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      {selected && (
        <div className="space-y-1.5 border-b border-border p-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Blend</span>
            <select
              value={selected.blendMode}
              onChange={(e) => layersApi.setBlendMode(selected.id, e.target.value as BlendMode)}
              className="flex-1 rounded border border-input bg-background px-1 py-0.5 text-[11px]"
            >
              {BLEND_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Opacity</span>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[selected.opacity]}
              onValueChange={([v]) => v !== undefined && layersApi.setOpacity(selected.id, v)}
              className="flex-1"
            />
            <span className="w-8 text-right text-[10px]">{Math.round(selected.opacity * 100)}%</span>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">
            No layers. Open an image or add a text/shape layer.
          </p>
        ) : (
          <ul className="space-y-0.5 p-1">
            {layers.map((layer, idx) => (
              <li
                key={layer.id}
                onClick={() => layersApi.select(layer.id)}
                className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-xs ${
                  selectedId === layer.id ? "bg-active/15" : "hover:bg-hover"
                }`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); layersApi.toggleVisible(layer.id); }}
                  aria-label="Toggle visibility"
                  className="rounded p-0.5 hover:bg-border"
                >
                  {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); layersApi.toggleLock(layer.id); }}
                  aria-label="Toggle lock"
                  className="rounded p-0.5 hover:bg-border"
                >
                  {layer.locked ? <Lock className="h-3 w-3 text-warning" /> : <LockOpen className="h-3 w-3 text-muted-foreground" />}
                </button>
                <span className="ml-1 inline-flex w-3 items-center justify-center">
                  {layer.kind === "image" && <ImageIcon className="h-3 w-3" />}
                  {layer.kind === "text" && <Type className="h-3 w-3" />}
                  {layer.kind === "shape" && <Square className="h-3 w-3" />}
                </span>
                <Input
                  value={layer.name}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => layersApi.renameLayer(layer.id, e.target.value)}
                  className="h-6 flex-1 border-0 bg-transparent px-1 text-xs focus-visible:ring-1"
                />
                <IconButton
                  aria-label="Move up"
                  disabled={idx === layers.length - 1}
                  onClick={(e) => { e.stopPropagation(); layersApi.reorderLayer(idx, idx + 1); }}
                  className="h-5 w-5"
                >
                  <ArrowUp className="h-3 w-3" />
                </IconButton>
                <IconButton
                  aria-label="Move down"
                  disabled={idx === 0}
                  onClick={(e) => { e.stopPropagation(); layersApi.reorderLayer(idx, idx - 1); }}
                  className="h-5 w-5"
                >
                  <ArrowDown className="h-3 w-3" />
                </IconButton>
                <IconButton
                  aria-label="Duplicate"
                  onClick={(e) => { e.stopPropagation(); layersApi.duplicateLayer(layer.id); }}
                  className="h-5 w-5"
                >
                  <Copy className="h-3 w-3" />
                </IconButton>
                <IconButton
                  aria-label="Delete"
                  onClick={(e) => { e.stopPropagation(); layersApi.removeLayer(layer.id); }}
                  className="h-5 w-5 text-error"
                >
                  <Trash2 className="h-3 w-3" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}