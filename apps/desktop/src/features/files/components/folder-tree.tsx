import { FileText, Folder, FolderOpen, Image, Package } from "lucide-react";
import type { StoragePaths } from "@/types/models";
import { cn } from "@/lib/cn";

interface Props {
  paths: StoragePaths;
  current: string;
  onSelect: (path: string) => void;
}

const ENTRIES: Array<{ key: keyof StoragePaths; label: string; icon: typeof Folder }> = [
  { key: "projects", label: "Projects", icon: FolderOpen },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "images", label: "Images", icon: Image },
  { key: "templates", label: "Templates", icon: Package },
  { key: "exports", label: "Exports", icon: Package },
  { key: "backups", label: "Backups", icon: Folder },
];

export function FolderTree({ paths, current, onSelect }: Props): JSX.Element {
  return (
    <div className="h-full overflow-auto rounded-lg border border-border bg-card p-2">
      <div className="mb-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground">Locations</div>
      <ul className="space-y-0.5">
        {ENTRIES.map((e) => (
          <li key={e.key}>
            <button
              onClick={() => onSelect(paths[e.key] as string)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-hover",
                current === paths[e.key] && "bg-active/15 text-foreground"
              )}
            >
              <e.icon className="h-4 w-4" />
              {e.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}