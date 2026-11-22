import {
  Brush,
  Circle,
  Crop,
  Lasso,
  MousePointer2,
  Move,
  Square,
  Wand2
} from "lucide-react";
import type { PhotoTool } from "@/types/photo";
import { cn } from "@/lib/cn";
import type { PhotoEditorApi } from "../hooks/use-photo-editor";

const TOOLS: { id: PhotoTool; label: string; icon: typeof Crop }[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "brush", label: "Brush", icon: Brush },
  { id: "crop", label: "Crop", icon: Crop },
  { id: "rect-select", label: "Rectangle Select", icon: Square },
  { id: "ellipse-select", label: "Ellipse Select", icon: Circle },
  { id: "lasso", label: "Lasso Select", icon: Lasso },
  { id: "magic-wand", label: "Magic Wand", icon: Wand2 },
  { id: "pan", label: "Pan", icon: Move }
];

export function PhotoToolsPanel({ editor }: { editor: PhotoEditorApi }): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-1 border-r border-border bg-card py-2">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          onClick={() => editor.setTool(t.id)}
          title={t.label}
          aria-label={t.label}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md hover:bg-hover",
            editor.tool === t.id && "bg-active/15 text-foreground"
          )}
        >
          <t.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}