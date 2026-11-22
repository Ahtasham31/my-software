import { useState } from "react";
import { Settings2 } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { ErrorState, LoadingState } from "@/components/data/states";
import { Button } from "@/components/ui/button";
import { WelcomeWidget } from "./widgets/welcome-widget";
import { QuickActionsWidget } from "./widgets/quick-actions-widget";
import { RecentProjectsWidget } from "./widgets/recent-projects-widget";
import { RecentFilesWidget } from "./widgets/recent-files-widget";
import { ActivityWidget } from "./widgets/activity-widget";
import { StorageWidget } from "./widgets/storage-widget";
import { SystemInfoWidget } from "./widgets/system-info-widget";
import { DashboardCustomizePanel } from "./components/dashboard-customize-panel";
import { useDashboardLayout } from "./hooks/use-dashboard-layout";

export function DashboardPage(): JSX.Element {
  const { summary, projects, recent, activity, loading, error, reload } = useDashboard();
  const layout = useDashboardLayout();
  const [customizeOpen, setCustomizeOpen] = useState(false);

  if (loading) {
    return (
      <PageContainer>
        <LoadingState label="Loading dashboard…" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState title="Dashboard failed" description={error} onRetry={() => void reload()} />
      </PageContainer>
    );
  }

  const show = layout.isVisible;

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Your workspace overview and recent activity."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCustomizeOpen((v) => !v)}>
              <Settings2 className="h-4 w-4" /> Customize
            </Button>
            <Button variant="outline" onClick={() => void reload()}>
              Refresh
            </Button>
          </div>
        }
      />

      {customizeOpen && (
        <div className="mb-4">
          <DashboardCustomizePanel
            isVisible={layout.isVisible}
            onToggle={(id) => void layout.toggleWidget(id)}
            onReset={() => void layout.reset()}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {show("welcome") && <WelcomeWidget />}
          {show("quickActions") && <QuickActionsWidget />}
          {show("recentProjects") && (
            <RecentProjectsWidget projects={projects.slice(0, 6)} onChanged={reload} />
          )}
          {show("recentFiles") && (
            <RecentFilesWidget recent={recent} onChanged={reload} />
          )}
        </div>
        <div className="space-y-4">
          {show("storage") && <StorageWidget summary={summary} />}
          {show("activity") && <ActivityWidget activity={activity} />}
          {show("systemInfo") && <SystemInfoWidget summary={summary} />}
        </div>
      </div>
    </PageContainer>
  );
}