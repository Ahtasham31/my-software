import { useCallback, useEffect, useState } from "react";
import {
  getDashboardPrefs,
  setDashboardPrefs,
  type DashboardPrefs
} from "@/services/dashboard-prefs";

const DEFAULT: DashboardPrefs = {
  hiddenWidgets: [],
  widgetOrder: [
    "welcome",
    "quickActions",
    "recentProjects",
    "recentFiles",
    "storage",
    "activity",
    "systemInfo"
  ]
};

export function useDashboardLayout() {
  const [prefs, setPrefs] = useState<DashboardPrefs>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const p = await getDashboardPrefs();
        setPrefs(p.hiddenWidgets.length || p.widgetOrder.length ? p : DEFAULT);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: DashboardPrefs) => {
    setPrefs(next);
    await setDashboardPrefs(next);
  }, []);

  const toggleWidget = useCallback(
    async (id: string) => {
      const hidden = prefs.hiddenWidgets.includes(id)
        ? prefs.hiddenWidgets.filter((w) => w !== id)
        : [...prefs.hiddenWidgets, id];
      await persist({ ...prefs, hiddenWidgets: hidden });
    },
    [prefs, persist]
  );

  const reset = useCallback(async () => {
    await persist(DEFAULT);
  }, [persist]);

  const isVisible = useCallback(
    (id: string) => !prefs.hiddenWidgets.includes(id),
    [prefs.hiddenWidgets]
  );

  return { prefs, loading, toggleWidget, reset, isVisible };
}