import { ArrowUp, Grid, Import, List, Plus, RefreshCw } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/display";

interface Props {
  currentPath: string;
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
  onRefresh: () => void;
  onImport: () => void;
  onNewFolder: () => void;
  onUp: () => void;
}

export function FileToolbar(p: Props): JSX.Element {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
      <IconButton onClick={p.onUp} aria-label="Up one level"><ArrowUp className="h-4 w-4" /></IconButton>
      <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">{p.currentPath}</code>
      <Button size="sm" variant="outline" onClick={p.onImport}><Import className="h-4 w-4" /> Import</Button>
      <Button size="sm" variant="outline" onClick={p.onNewFolder}><Plus className="h-4 w-4" /> New folder</Button>
      <IconButton aria-label="Refresh" onClick={p.onRefresh}><RefreshCw className="h-4 w-4" /></IconButton>
      <div className="flex items-center rounded-md border border-border">
        <Tooltip><TooltipTrigger asChild>
          <button onClick={() => p.onViewChange("grid")} className={`p-1.5 ${p.view === "grid" ? "bg-hover" : ""}`}><Grid className="h-4 w-4" /></button>
        </TooltipTrigger><TooltipContent>Grid view</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild>
          <button onClick={() => p.onViewChange("list")} className={`p-1.5 ${p.view === "list" ? "bg-hover" : ""}`}><List className="h-4 w-4" /></button>
        </TooltipTrigger><TooltipContent>List view</TooltipContent></Tooltip>
      </div>
    </div>
  );
}