import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/overlay";
import { Input } from "@/components/ui/form";
import { NAV_GROUPS } from "@/app/nav-config";
import { cn } from "@/lib/cn";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  group: string;
  action: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps): JSX.Element {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const items = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = NAV_GROUPS.flatMap((g) =>
      g.items.map((item) => ({
        id: `nav:${item.to}`,
        label: item.label,
        group: g.label,
        action: () => { navigate(item.to); onClose(); }
      }))
    );
    return navItems;
  }, [navigate, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl p-0">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Command className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and commands"
            className="h-8 border-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </div>
        <div className="max-h-80 overflow-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              No results for "{query}"
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <span>{item.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {item.group}
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}