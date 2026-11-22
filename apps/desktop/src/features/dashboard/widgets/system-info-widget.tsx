import type { DashboardSummary } from "@/types/models";

export function SystemInfoWidget({ summary }: { summary: DashboardSummary | null }): JSX.Element {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-card-heading">System</h3>
      <dl className="space-y-1 text-xs">
        <div className="flex justify-between"><dt className="text-muted-foreground">Projects</dt><dd>{summary?.projectCount ?? 0}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Recent items</dt><dd>{summary?.recentFileCount ?? 0}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Activity</dt><dd>{summary?.activityCount ?? 0}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Storage root</dt><dd className="truncate max-w-[10rem]" title={summary?.storage.root}>{summary?.storage.root ?? "—"}</dd></div>
      </dl>
    </div>
  );
}