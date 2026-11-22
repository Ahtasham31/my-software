import { useState } from "react";
import {
  FileText,
  FileImage,
  ScanText,
  Files,
  Languages,
  History,
  Settings as SettingsIcon,
  LayoutDashboard
} from "lucide-react";
// import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ImageToTextPage } from "./image-to-text-page"
// import { ImageToTextPage } from "./image-to-text-page";
import { PdfToTextPage } from "./pdf-to-text-page";
import { ReviewPage } from "./review-page";
import { BatchOcrPage } from "./batch-ocr-page";
import { HistoryPage } from "./history-page";
import { LanguageManagerPage } from "./language-manager-page";
import { SettingsPage } from "./settings-page";
import { OcrDashboard } from "./dashboard";

type Tab =
  | "dashboard"
  | "image"
  | "pdf"
  | "review"
  | "batch"
  | "history"
  | "languages"
  | "settings";

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "image", label: "Image to Text", icon: FileImage },
  { id: "pdf", label: "PDF to Text", icon: FileText },
  { id: "review", label: "Review", icon: ScanText },
  { id: "batch", label: "Batch", icon: Files },
  { id: "history", label: "History", icon: History },
  { id: "languages", label: "Languages", icon: Languages },
  { id: "settings", label: "Settings", icon: SettingsIcon }
];

export function OcrPage(): JSX.Element {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="flex h-[calc(100vh-3.5rem-1.75rem)] flex-col">
      <div className="flex items-center gap-1 border-b border-border bg-card px-2 py-1.5 overflow-x-auto">
        {TABS.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={tab === t.id ? "default" : "ghost"}
            onClick={() => setTab(t.id)}
            className={cn("text-xs")}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </Button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "dashboard" && <OcrDashboard onNavigate={(t) => setTab(t as Tab)} />}
        {tab === "image" && <ImageToTextPage />}
        {tab === "pdf" && <PdfToTextPage />}
        {tab === "review" && <ReviewPage />}
        {tab === "batch" && <BatchOcrPage />}
        {tab === "history" && <HistoryPage />}
        {tab === "languages" && <LanguageManagerPage />}
        {tab === "settings" && <SettingsPage />}
      </div>
    </div>
  );
}