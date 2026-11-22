import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, useToast } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/data/states";
import { listProjects, type PassportProject } from "@/services/passport";

interface Props {
  open: boolean;
  onClose: () => void;
  onLoad: (sourcePath: string | null, settingsJson: string | null) => Promise<void>;
}

export function OpenProjectDialog({ open, onClose, onLoad }: Props): JSX.Element {
  const toast = useToast();
  const [projects, setProjects] = useState<PassportProject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void (async () => {
      try {
        setProjects(await listProjects());
      } catch (e) {
        toast.show({
          title: "Load failed",
          description: (e as { message?: string }).message,
          variant: "error"
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [open, toast]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Open passport project</DialogTitle>
        </DialogHeader>
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No saved projects"
            description="Save a project from the toolbar to see it here."
          />
        ) : (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(p.updatedAt).toLocaleString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await onLoad(p.sourcePath, p.settingsJson);
                    onClose();
                  }}
                >
                  Open
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}