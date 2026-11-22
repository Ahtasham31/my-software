import { FolderOpen, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/display";
import {  IconButton } from "@/components/ui/button";
import type { OcrJob } from "@/types/ocr";

interface Props {
  job: OcrJob;
  onDelete: (id: string) => void;
  onReveal?: (path: string) => void;
}

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "error" | "secondary"> = {
  completed: "success",
  failed: "error",
  running: "warning",
  pending: "secondary",
  cancelled: "secondary"
};

export function JobCard({ job, onDelete, onReveal }: Props): JSX.Element {
  const sourceName = job.sourcePath.split(/[\\/]/).pop() ?? job.sourcePath;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{sourceName}</span>
          <Badge variant={STATUS_VARIANT[job.status] ?? "secondary"}>
            {job.status}
          </Badge>
          <Badge variant="outline">{job.kind}</Badge>
        </div>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Lang: {job.language}</span>
          <span>Pages: {job.pageCount}</span>
          {job.durationMs !== null && <span>{job.durationMs}ms</span>}
          <span>{new Date(job.createdAt).toLocaleString()}</span>
        </div>
        {job.errorMessage && (
          <div className="mt-1 truncate text-xs text-error">{job.errorMessage}</div>
        )}
        {job.previewText && (
          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {job.previewText}
          </div>
        )}
      </div>
      <div className="flex flex-shrink-0 gap-1">
        {job.outputPath && onReveal && (
          <IconButton
            aria-label="Reveal"
            onClick={() => onReveal(job.outputPath!)}
            className="h-7 w-7"
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </IconButton>
        )}
        <IconButton
          aria-label="Delete"
          onClick={() => onDelete(job.id)}
          className="h-7 w-7 text-error"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>
    </div>
  );
}