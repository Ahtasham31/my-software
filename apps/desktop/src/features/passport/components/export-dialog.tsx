import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, useToast } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form";
import { saveDataUrl } from "@/services/passport";
import { saveFileDialog } from "@/services/photo";

interface Props {
  open: boolean;
  onClose: () => void;
  preview: HTMLCanvasElement | null;
  defaultName: string;
  widthPx: number;
  heightPx: number;
}

export function ExportDialog({
  open,
  onClose,
  preview,
  defaultName,
  widthPx,
  heightPx
}: Props): JSX.Element {
  const toast = useToast();
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(0.95);
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (!preview) return;
    const ext = format;
    const filters: string[][] =
      ext === "jpg" || ext === "jpeg"
        ? [["JPEG", "jpg", "jpeg"]]
        : ext === "webp"
        ? [["WebP", "webp"]]
        : [["PNG", "png"]];

    const target = await saveFileDialog(`${name}.${ext}`, filters);
    if (!target) return;

    setBusy(true);
    try {
      const dataUrl =
        ext === "jpg" || ext === "jpeg"
          ? preview.toDataURL("image/jpeg", quality)
          : ext === "webp"
          ? preview.toDataURL("image/webp", quality)
          : preview.toDataURL("image/png");
      await saveDataUrl(target, dataUrl);
      toast.show({ title: "Exported", variant: "success" });
      onClose();
    } catch (e) {
      toast.show({
        title: "Export failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export passport photo</DialogTitle>
          <DialogDescription>
            {widthPx} × {heightPx} px @ 300 DPI
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>File name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(format === "jpg" || format === "jpeg" || format === "webp") && (
            <div>
              <Label>Quality: {Math.round(quality * 100)}%</Label>
              <Input
                type="range"
                min={0.5}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
              />
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={() => void handleExport()} disabled={busy || !preview}>
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}