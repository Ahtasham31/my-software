import { Link } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import type { Project } from "@/types/models";
import { EmptyState } from "@/components/data/states";

interface Props {
  projects: Project[];
  onChanged: () => void;
}

export function RecentProjectsWidget({ projects }: Props): JSX.Element {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-card-heading">Recent projects</h3>
        <Link to="/files" className="text-xs text-primary hover:underline">
          Open File Manager
        </Link>
      </div>
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to see it here."
          icon={<FolderOpen className="h-6 w-6" />}
        />
      ) : (
        <ul className="divide-y divide-border">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{p.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {new Date(p.updatedAt).toLocaleString()}
                </div>
              </div>
              <code className="hidden truncate rounded bg-muted px-1 text-[10px] text-muted-foreground md:block">
                {p.rootPath}
              </code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}