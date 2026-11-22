import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/data/states";
import { useConfirm, useToast } from "@/components/ui/overlay";
import { clearJobs, deleteJob, listJobs } from "@/services/ocr";
import { revealInOS } from "@/services/files";
import type { OcrJob } from "@/types/ocr";
import { JobCard } from "./components/job-card";

export function HistoryPage(): JSX.Element {
  const toast = useToast();
  const confirm = useConfirm();
  const [jobs, setJobs] = useState<OcrJob[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      setJobs(await listJobs(200));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const handleDelete = (id: string) => {
    confirm.confirm({
      title: "Delete this history entry?",
      description: "This does not delete source or output files.",
      destructive: true,
      confirmLabel: "Delete",
      onConfirm: async () => {
        await deleteJob(id);
        await reload();
        toast.show({ title: "Deleted", variant: "success" });
      }
    });
  };

  const handleClear = () => {
    confirm.confirm({
      title: "Clear all history?",
      description: "This does not delete any files.",
      destructive: true,
      confirmLabel: "Clear",
      onConfirm: async () => {
        await clearJobs();
        await reload();
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="OCR History"
        description="Past jobs, statuses, and output references."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void reload()}>Refresh</Button>
            <Button variant="destructive" onClick={handleClear} disabled={jobs.length === 0}>
              <Trash2 className="h-4 w-4" /> Clear all
            </Button>
          </div>
        }
      />
      {loading ? (
        <LoadingState />
      ) : jobs.length === 0 ? (
        <EmptyState title="No history" description="OCR jobs you run will appear here." />
      ) : (
        <div className="space-y-2">
          {jobs.map((j) => (
            <JobCard
              key={j.id}
              job={j}
              onDelete={handleDelete}
              onReveal={(path) => void revealInOS(path)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}