import { Construction } from "lucide-react";
import { Badge } from "@/components/ui/display";
import { PageContainer, PageHeader } from "@/components/layout/page-container";

interface Props {
  title: string;
  moduleId: string;
}

export function ModulePlaceholderPage({ title, moduleId }: Props): JSX.Element {
  return (
    <PageContainer>
      <PageHeader
        title={title}
        description="This module will be implemented in a future phase."
        actions={<Badge variant="outline">{moduleId}</Badge>}
      />
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <Construction className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="text-section">Not implemented yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Phase 02 provides the design system and application shell only. Module functionality
          will arrive in its dedicated phase.
        </p>
      </div>
    </PageContainer>
  );
}