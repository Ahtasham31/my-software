import { FileText, Folder } from "lucide-react";
import type { FileEntry } from "@/types/models";

interface Props {
  entries: FileEntry[];
  onSelect: (e: FileEntry) => void;
  onOpen: (e: FileEntry) => void;
}

export function FileList({ entries, onSelect, onOpen }: Props): JSX.Element {
  if (entries.length === 0) {
    return <p className="p-8 text-center text-sm text-muted-foreground">This folder is empty.</p>;
  }
  return (
    <table className="w-full text-sm">
      <thead className="border-b border-border text-xs uppercase text-muted-foreground">
        <tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Size</th><th className="p-2 text-left">Modified</th></tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr
            key={e.path}
            onClick={() => onSelect(e)}
            onDoubleClick={() => onOpen(e)}
            className="cursor-pointer border-b border-border hover:bg-hover"
          >
            <td className="flex items-center gap-2 p-2">
              {e.isDir ? <Folder className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
              <span className="truncate">{e.name}</span>
            </td>
            <td className="p-2 text-xs text-muted-foreground">{e.isDir ? "—" : `${e.size} B`}</td>
            <td className="p-2 text-xs text-muted-foreground">{e.modified ? new Date(e.modified).toLocaleString() : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}