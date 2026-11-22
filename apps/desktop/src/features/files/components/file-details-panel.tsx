import { Pencil, Star, StarOff, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FileEntry } from "@/types/models";
import { Button } from "@/components/ui/button";
import { revealInOS } from "@/services/files";
import { addFavorite, isFavorite, removeFavorite } from "@/services/favorites";

interface Props {
  entry: FileEntry | null;
  onRename: (e: FileEntry) => void;
  onDelete: (e: FileEntry) => void;
}

export function FileDetailsPanel({ entry, onRename, onDelete }: Props): JSX.Element {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!entry) return;
    void isFavorite("file", entry.path).then(setFav).catch(() => setFav(false));
  }, [entry]);

  if (!entry) {
    return (
      <div className="h-full rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Select a file to see details.</p>
      </div>
    );
  }

  const toggleFav = async () => {
    if (fav) await removeFavorite("file", entry.path);
    else await addFavorite("file", entry.path, entry.name);
    setFav(!fav);
  };

  return (
    <div className="h-full overflow-auto rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 truncate text-card-heading">{entry.name}</h3>
      <dl className="space-y-1 text-xs">
        <Row label="Type" value={entry.isDir ? "Folder" : (entry.extension ?? "file")} />
        <Row label="Size" value={entry.isDir ? "—" : `${entry.size} B`} />
        <Row label="Modified" value={entry.modified ? new Date(entry.modified).toLocaleString() : "—"} />
        <Row label="Path" value={entry.path} mono />
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={toggleFav}>
          {fav ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
          {fav ? "Unfavorite" : "Favorite"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onRename(entry)}>
          <Pencil className="h-3 w-3" /> Rename
        </Button>
        <Button size="sm" variant="outline" onClick={() => void revealInOS(entry.path)}>
          Show in OS
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(entry)}>
          <Trash2 className="h-3 w-3" /> Delete
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }): JSX.Element {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`max-w-[14rem] truncate text-right ${mono ? "font-mono text-[10px]" : ""}`} title={value}>{value}</dd>
    </div>
  );
}