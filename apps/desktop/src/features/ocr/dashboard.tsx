import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/display";
import { Button } from "@/components/ui/button";
import { checkEngine, listJobs } from "@/services/ocr";
import type { OcrEngineStatus, OcrJob } from "@/types/ocr";

interface Props {
  onNavigate: (tab: string) => void;
}

export function OcrDashboard({ onNavigate }: Props): JSX.Element {
  const [engine, setEngine] = useState<OcrEngineStatus | null>(null);
  const [jobs, setJobs] = useState<OcrJob[]>([]);

  useEffect(() => {
    void (async () => {
      const [e, j] = await Promise.all([checkEngine(), listJobs(5)]);
      setEngine(e);
      setJobs(j);
    })();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="OCR Studio"
        description="Convert images and PDFs to editable text — fully offline, no AI."
        actions={
          <Button onClick={() => onNavigate("image")}>Start OCR</Button>
        }
      />

      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          {engine?.available ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-warning" />
          )}
          <h3 className="text-card-heading">OCR Engine</h3>
          <Badge variant={engine?.available ? "success" : "warning"}>
            {engine?.available ? "Ready" : "Not detected"}
          </Badge>
        </div>
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          <div>Tesseract: {engine?.version ?? "not found"}</div>
          <div>Poppler (for scanned PDF): {engine?.popplerAvailable ? "available" : "missing"}</div>
          {!engine?.available && (
            <div className="mt-2 rounded border border-warning/40 bg-warning/10 p-2 text-foreground">
              Install Tesseract OCR and add it to PATH to use OCR features.
              Language packs for English (eng), Urdu (urd), and Arabic (ara) are required.
            </div>
          )}
          {!engine?.popplerAvailable && (
            <div className="mt-2 rounded border border-warning/40 bg-warning/10 p-2 text-foreground">
              Install Poppler (pdftoppm) to enable scanned PDF OCR and searchable PDF output.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Tile label="Image to Text" onClick={() => onNavigate("image")} icon={FileText} />
        <Tile label="PDF to Text" onClick={() => onNavigate("pdf")} icon={FileText} />
        <Tile label="Review" onClick={() => onNavigate("review")} icon={FileText} />
        <Tile label="Batch OCR" onClick={() => onNavigate("batch")} icon={FileText} />
        <Tile label="Languages" onClick={() => onNavigate("languages")} icon={FileText} />
        <Tile label="History" onClick={() => onNavigate("history")} icon={FileText} />
      </div>

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-semibold">Recent jobs</h3>
        {jobs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            No jobs yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {jobs.map((j) => (
              <li key={j.id} className="flex items-center gap-2 rounded-md border border-border bg-card p-2 text-xs">
                <Badge variant={j.status === "completed" ? "success" : j.status === "failed" ? "error" : "secondary"}>
                  {j.status}
                </Badge>
                <span className="flex-1 truncate">{j.sourcePath.split(/[\\/]/).pop()}</span>
                <span className="text-muted-foreground">{j.language}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  );
}

function Tile({ label, onClick, icon: Icon }: { label: string; onClick: () => void; icon: typeof FileText }): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-left hover:bg-hover"
    >
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}