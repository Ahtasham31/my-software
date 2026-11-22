import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import type { RecentItem } from "@/types/models";
import { EmptyState } from "@/components/data/states";

interface Props {
  recent: RecentItem[];
  onChanged: () => void;
}

export function RecentFilesWidget({ recent }: Props): JSX.Element {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-card-heading">Recent files</h3>
        <Link to="/files" className="text-xs text-primary hover:underline">View all</Link>
      </div>
      {recent.length === 0 ? (
        <EmptyState
          title="No recent files"
          description="Open or import files to see them here."
          icon={<FileText className="h-6 w-6" />}
        />
      ) : (
        <ul className="divide-y divide-border">
          {recent.map((r) => (
            <li key={r.id} className="py-2 text-sm">
              <div className="truncate font-medium">{r.label ?? r.path.split(/[\\/]/).pop()}</div>
              <div className="truncate text-xs text-muted-foreground">
                {r.itemType} · {new Date(r.lastOpenedAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}