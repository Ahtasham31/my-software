import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title, description, icon, action
}: { title: string; description?: string; icon?: ReactNode; action?: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-10 text-center">
      <div className="text-muted-foreground">{icon ?? <Inbox className="h-8 w-8" />}</div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }): JSX.Element {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry
}: { title?: string; description?: string; onRetry?: () => void }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-error/40 bg-error/5 p-8 text-center">
      <AlertCircle className="h-8 w-8 text-error" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Retry
        </Button>
      )}
    </div>
  );
}
