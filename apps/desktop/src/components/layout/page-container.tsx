import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageContainer({
  children, className
}: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={cn("mx-auto w-full max-w-[1400px] p-6", className)}>{children}</div>;
}

export function PageHeader({
  title, description, actions
}: { title: string; description?: string; actions?: ReactNode }): JSX.Element {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-title">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}