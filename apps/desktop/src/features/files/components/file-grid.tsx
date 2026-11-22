import { FileText, Folder } from "lucide-react";
import type { FileEntry } from "@/types/models";
import { cn } from "@/lib/cn";

interface Props {
  entries: FileEntry[];
  onSelect: (e: FileEntry) => void;
  onOpen: (e: FileEntry) => void;
  onContext: (e: FileEntry) => void;
}

export function FileGrid({ entries, onSelect, onOpen, onContext }: Props): JSX.Element {
  if (entries.length === 0) {
    return <p className="p-8 text-center text-sm text-muted-foreground">This folder is empty.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {entries.map((e) => (
        <button
          key={e.path}
          onClick={() => onSelect(e)}
          onDoubleClick={() => onOpen(e)}
          onContextMenu={(ev) => { ev.preventDefault(); onContext(e); }}
          className={cn(
            "flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3 text-left hover:bg-hover"
          )}
        >
          <div className="flex h-12 w-full items-center justify-center rounded bg-muted">
            {e.isDir ? <Folder className="h-6 w-6 text-primary" /> : <FileText className="h-6 w-6 text-muted-foreground" />}
          </div>
          <div className="w-full truncate text-xs font-medium">{e.name}</div>
          <div className="text-[10px] text-muted-foreground">
            {e.isDir ? "Folder" : formatBytes(e.size)}
          </div>
        </button>
      ))}
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}