import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { createProject } from "@/services/projects";
import { useToast } from "@/components/ui/overlay";
import type { Project } from "@/types/models";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (p: Project) => void;
}

export function CreateProjectDialog({ open, onClose, onCreated }: Props): JSX.Element {
  const toast = useToast();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const p = await createProject({ name: name.trim() });
      toast.show({ title: "Project created", description: p.name, variant: "success" });
      onCreated?.(p);
      setName("");
      onClose();
    } catch (e) {
      toast.show({ title: "Create failed", description: (e as { message?: string }).message, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Creates a project folder under storage/projects.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="proj-name">Name</Label>
          <Input id="proj-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={busy || !name.trim()}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}