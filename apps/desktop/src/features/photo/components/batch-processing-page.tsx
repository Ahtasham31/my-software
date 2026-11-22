import { FolderInput, FolderOpen, Play, X } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button, IconButton } from "@/components/ui/button";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form";
import { Badge } from "@/components/ui/display";
import { EmptyState } from "@/components/data/states";
import { useBatchProcessing } from "../hooks/use-batch-processing";

export function BatchProcessingPage(): JSX.Element {
  const batch = useBatchProcessing();

  return (
    <PageContainer>
      <PageHeader
        title="Batch Processing"
        description="Resize and convert multiple images in one go. Original files are never modified."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-card-heading">Source files ({batch.sources.length})</h3>
            <Button size="sm" onClick={() => void batch.pickSources()}>
              <FolderInput className="h-3.5 w-3.5" /> Add files
            </Button>
          </div>
          {batch.sources.length === 0 ? (
            <EmptyState title="No files added" description="Add images to process them in bulk." />
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {batch.sources.map((s) => (
                <li key={s} className="flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs">
                  <span className="flex-1 truncate">{s.split(/[\\/]/).pop()}</span>
                  <IconButton
                    aria-label="Remove"
                    onClick={() => batch.setSources((prev) => prev.filter((p) => p !== s))}
                    className="h-5 w-5"
                  >
                    <X className="h-3 w-3" />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-card-heading">Settings</h3>
          <div className="space-y-3">
            <div>
              <Label>Output folder</Label>
              <div className="flex gap-1">
                <Input value={batch.outputDir} readOnly placeholder="Choose folder…" />
                <Button size="sm" variant="outline" onClick={() => void batch.pickOutputDir()}>
                  <FolderOpen className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Width</Label>
                <Input
                  type="number"
                  value={batch.width ?? ""}
                  onChange={(e) => batch.setWidth(e.target.value ? parseInt(e.target.value, 10) : null)}
                  placeholder="auto"
                />
              </div>
              <div>
                <Label>Height</Label>
                <Input
                  type="number"
                  value={batch.height ?? ""}
                  onChange={(e) => batch.setHeight(e.target.value ? parseInt(e.target.value, 10) : null)}
                  placeholder="auto"
                />
              </div>
            </div>
            <div>
              <Label>Output format</Label>
              <Select value={batch.format} onValueChange={batch.setFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPEG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                  <SelectItem value="bmp">BMP</SelectItem>
                  <SelectItem value="tiff">TIFF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => void batch.run()}
              disabled={batch.busy || batch.sources.length === 0 || !batch.outputDir}
              className="w-full"
            >
              <Play className="h-4 w-4" /> Process batch
            </Button>
          </div>
        </div>
      </div>

      {batch.results.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-card-heading">
            Results —{" "}
            <span className="text-success">{batch.results.filter((r) => r.success).length} ok</span>,{" "}
            <span className="text-error">{batch.results.filter((r) => !r.success).length} failed</span>
          </h3>
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {batch.results.map((r) => (
              <li key={r.source} className="flex items-center gap-2 text-xs">
                <Badge variant={r.success ? "success" : "error"}>
                  {r.success ? "OK" : "ERR"}
                </Badge>
                <span className="flex-1 truncate">{r.source.split(/[\\/]/).pop()}</span>
                {r.error && <span className="text-error truncate">{r.error}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageContainer>
  );
}