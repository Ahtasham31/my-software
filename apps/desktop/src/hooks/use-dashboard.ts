import { useCallback, useEffect, useState } from "react";
import { getDashboardSummary } from "@/services/dashboard";
import { listRecent, listActivity } from "@/services/data";
import { listProjects } from "@/services/projects";
import type { ActivityEntry, DashboardSummary, Project, RecentItem } from "@/types/models";

interface DashboardState {
  summary: DashboardSummary | null;
  projects: Project[];
  recent: RecentItem[];
  activity: ActivityEntry[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useDashboard(): DashboardState {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, p, r, a] = await Promise.all([
        getDashboardSummary(),
        listProjects(),
        listRecent(10),
        listActivity(8)
      ]);
      setSummary(s);
      setProjects(p);
      setRecent(r);
      setActivity(a);
    } catch (e) {
      setError((e as { message?: string }).message ?? "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { summary, projects, recent, activity, loading, error, reload };
}