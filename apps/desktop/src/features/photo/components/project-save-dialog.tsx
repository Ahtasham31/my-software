import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { useToast } from "@/components/ui/overlay";
import type { Layer } from "@/types/photo-layers";
import { serializeLayers } from "../hooks/use-project-persistence";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  layers: Layer[];
  width: number;
  height: number;
  format: string;
  sourcePath: string | null;
  defaultName: string;
}

export function ProjectSaveDialog({
  open,
  onClose,
  onSaved,
  layers,
  width,
  height,
  format,
  sourcePath,
  defaultName
}: Props): JSX.Element {
  const toast = useToast();
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const layersJson = serializeLayers(layers);
      const { invokeNative } = await import("@/services/native");
      await invokeNative("photo_project_save", {
        input: {
          name: name.trim(),
          sourcePath,
          width,
          height,
          format,
          metadataJson: null,
          layersJson
        }
      });
      toast.show({ title: "Project saved", description: name, variant: "success" });
      onSaved();
      onClose();
    } catch (e) {
      toast.show({ title: "Save failed", description: (e as { message?: string }).message, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save project</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Project name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <p className="text-xs text-muted-foreground">
            {layers.length} layer(s) · {width}×{height}px
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={() => void save()} disabled={busy || !name.trim()}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}