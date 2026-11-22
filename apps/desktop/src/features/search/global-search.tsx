import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/form";
import { useDebounce } from "@/hooks/use-debounce";
import { globalSearch } from "@/services/search";
import type { SearchHit } from "@/types/models";

export function GlobalSearch(): JSX.Element {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 250);

  useEffect(() => {
    if (debounced.trim().length < 2) { setHits([]); return; }
    setLoading(true);
    void (async () => {
      try { setHits(await globalSearch(debounced.trim(), 20)); }
      finally { setLoading(false); }
    })();
  }, [debounced]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-md border border-input bg-background/60 px-3 py-1.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects, files, recent items…"
          className="h-7 border-0 bg-transparent px-0 focus-visible:ring-0"
        />
      </div>
      {query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-80 overflow-auto rounded-md border border-border bg-popover p-2 shadow-lg">
          {loading ? (
            <p className="p-2 text-xs text-muted-foreground">Searching…</p>
          ) : hits.length === 0 ? (
            <p className="p-2 text-xs text-muted-foreground">No results.</p>
          ) : (
            <ul>
              {hits.map((h) => (
                <li key={`${h.kind}:${h.id}`}>
                  <button
                    onClick={() => {
                      if (h.path) navigate("/files");
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-hover"
                  >
                    <span className="truncate">{h.label}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">{h.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}