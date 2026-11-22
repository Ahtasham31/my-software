import { X } from "lucide-react";
import { IconButton } from "@/components/ui/button";
import { SHORTCUTS } from "../hooks/use-photo-shortcuts";

export function ShortcutPanel({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <div className="absolute right-4 top-4 z-40 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Keyboard shortcuts</h3>
        <IconButton aria-label="Close" onClick={onClose} className="h-6 w-6">
          <X className="h-3.5 w-3.5" />
        </IconButton>
      </div>
      <dl className="space-y-1 text-xs">
        {SHORTCUTS.map((s) => (
          <div key={s.keys} className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{s.action}</dt>
            <dd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">{s.keys}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}