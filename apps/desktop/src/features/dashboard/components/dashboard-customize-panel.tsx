import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WIDGETS = [
  { id: "welcome", label: "Welcome" },
  { id: "quickActions", label: "Quick Actions" },
  { id: "recentProjects", label: "Recent Projects" },
  { id: "recentFiles", label: "Recent Files" },
  { id: "storage", label: "Storage" },
  { id: "activity", label: "Recent Activity" },
  { id: "systemInfo", label: "System Info" }
];

interface Props {
  isVisible: (id: string) => boolean;
  onToggle: (id: string) => void;
  onReset: () => void;
}

export function DashboardCustomizePanel({ isVisible, onToggle, onReset }: Props): JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Customize</CardTitle>
        <Button size="sm" variant="ghost" onClick={onReset}>
          <RotateCcw className="h-3 w-3" /> Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {WIDGETS.map((w) => {
          const visible = isVisible(w.id);
          return (
            <button
              key={w.id}
              onClick={() => onToggle(w.id)}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-hover"
            >
              <span>{w.label}</span>
              {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}