import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@/components/ui/form";
import { useToast } from "@/components/ui/overlay";
import { DEFAULT_OCR_SETTINGS, type OcrSettings } from "@/types/ocr";

const KEY = "docuverse.ocr.settings.v1";

function loadSettings(): OcrSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_OCR_SETTINGS;
    return { ...DEFAULT_OCR_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_OCR_SETTINGS;
  }
}

export function SettingsPage(): JSX.Element {
  const toast = useToast();
  const [settings, setSettings] = useState<OcrSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  const reset = () => {
    setSettings(DEFAULT_OCR_SETTINGS);
    toast.show({ title: "Reset to defaults", variant: "success" });
  };

  return (
    <PageContainer>
      <PageHeader
        title="OCR Settings"
        description="Defaults for OCR Studio."
        actions={<Button variant="outline" onClick={reset}>Reset</Button>}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div>
            <Label>Default language</Label>
            <Input
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
            />
          </div>
          <div>
            <Label>Default page segmentation</Label>
            <Select
              value={String(settings.defaultPsm)}
              onValueChange={(v) => setSettings({ ...settings, defaultPsm: Number(v) })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Auto (3)</SelectItem>
                <SelectItem value="6">Single block (6)</SelectItem>
                <SelectItem value="4">Single column (4)</SelectItem>
                <SelectItem value="11">Sparse (11)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Default output format</Label>
            <Select
              value={settings.defaultOutputFormat}
              onValueChange={(v) =>
                setSettings({ ...settings, defaultOutputFormat: v as OcrSettings["defaultOutputFormat"] })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="txt">TXT</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Confirm before export</Label>
            <Switch
              checked={settings.confirmBeforeExport}
              onCheckedChange={(v) => setSettings({ ...settings, confirmBeforeExport: v })}
            />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div>
            <Label>Performance profile</Label>
            <Select
              value={settings.performanceProfile}
              onValueChange={(v) =>
                setSettings({ ...settings, performanceProfile: v as OcrSettings["performanceProfile"] })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low-ram">Low-RAM</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="high-performance">High-Performance</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Max concurrent jobs</Label>
            <Input
              type="number"
              min={1}
              max={8}
              value={settings.maxConcurrentJobs}
              onChange={(e) =>
                setSettings({ ...settings, maxConcurrentJobs: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
            />
          </div>
          <div>
            <Label>Default export folder</Label>
            <Input
              value={settings.defaultExportFolder}
              onChange={(e) => setSettings({ ...settings, defaultExportFolder: e.target.value })}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}