import type { DashboardSummary } from "@/types/models";

function fmt(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}

export function StorageWidget({ summary }: { summary: DashboardSummary | null }): JSX.Element {
  const s = summary?.storage;
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-card-heading">Storage usage</h3>
      {!s ? (
        <p className="text-xs text-muted-foreground">Unavailable</p>
      ) : (
        <dl className="space-y-1 text-xs">
          <Row label="Projects" value={fmt(s.projectsBytes)} />
          <Row label="Documents" value={fmt(s.documentsBytes)} />
          <Row label="Images" value={fmt(s.imagesBytes)} />
          <Row label="Exports" value={fmt(s.exportsBytes)} />
          <Row label="Backups" value={fmt(s.backupsBytes)} />
        </dl>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}