import { HardDrive, Layers, Zap } from "lucide-react";
import { useTheme } from "@/design-system/useTheme";

export function StatusBar(): JSX.Element {
  const { theme, appearance } = useTheme();

  return (
    <footer className="flex h-7 items-center gap-4 border-t border-border bg-card px-3 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <Zap className="h-3 w-3" /> Ready
      </span>
      <span className="inline-flex items-center gap-1">
        <Layers className="h-3 w-3" /> Theme: {theme.name} · {appearance.mode}
      </span>
      <span className="inline-flex items-center gap-1">
        <HardDrive className="h-3 w-3" /> Local-first · Offline ready
      </span>
      <span className="ml-auto">DocuVerse Studio · Phase 02</span>
    </footer>
  );
}