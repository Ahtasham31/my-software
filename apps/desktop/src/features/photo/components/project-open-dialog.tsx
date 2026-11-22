import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/data/states";
import { invokeNative } from "@/services/native";
import { useToast } from "@/components/ui/overlay";
import { deserializeLayers } from "../hooks/use-project-persistence";
import type { Layer } from "@/types/photo-layers";

interface PhotoProject {
  id: string;
  name: string;
  projectPath: string;
  sourcePath: string | null;
  width: number;
  height: number;
  format: string;
  metadataJson: string | null;
  layersJson: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onLoaded: (project: PhotoProject, layers: Layer[]) => void;
}

export function ProjectOpenDialog({ open, onClose, onLoaded }: Props): JSX.Element {
  const toast = useToast();
  const [projects, setProjects] = useState<PhotoProject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void (async () => {
      try {
        const list = await invokeNative<PhotoProject[]>("photo_projects_list");
        setProjects(list);
      } catch (e) {
        toast.show({ title: "Load failed", description: (e as { message?: string }).message, variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [open, toast]);

  const choose = async (project: PhotoProject) => {
    if (!project.layersJson) {
      toast.show({ title: "Project has no layers", variant: "warning" });
      return;
    }
    try {
      const layers = await deserializeLayers(project.layersJson);
      onLoaded(project, layers);
      onClose();
    } catch (e) {
      toast.show({ title: "Load failed", description: (e as { message?: string }).message, variant: "error" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Open photo project</DialogTitle>
        </DialogHeader>
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState title="No photo projects" description="Save a project from the editor to see it here." />
        ) : (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.width}×{p.height} · {p.format} · {new Date(p.updatedAt).toLocaleString()}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => void choose(p)}>Open</Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}