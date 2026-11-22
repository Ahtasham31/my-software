import type { ActivityEntry } from "@/types/models";

interface Props { activity: ActivityEntry[] }

export function ActivityWidget({ activity }: Props): JSX.Element {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-card-heading">Recent activity</h3>
      {activity.length === 0 ? (
        <p className="text-xs text-muted-foreground">No activity yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {activity.map((a) => (
            <li key={a.id} className="text-xs">
              <div className="font-medium">{a.event}</div>
              <div className="text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}