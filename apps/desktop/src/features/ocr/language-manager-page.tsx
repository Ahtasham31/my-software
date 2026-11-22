import { useEffect, useState } from "react";
import { FolderInput, Info } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/display";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/overlay";
import { openFileDialog } from "@/services/dialog";
import {
  getLanguagePackInfo,
  installLanguagePack,
  listLanguages
} from "@/services/ocr";
import type { LanguageInfo } from "@/types/ocr";

export function LanguageManagerPage(): JSX.Element {
  const toast = useToast();
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [tessdataPath, setTessdataPath] = useState<string>("");
  const [installing, setInstalling] = useState(false);

  const reload = async () => {
    setLanguages(await listLanguages());
    try {
      const info = await getLanguagePackInfo();
      setTessdataPath(info);
    } catch {
      setTessdataPath("unknown");
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const handleInstall = async (code: string) => {
    const files = await openFileDialog(false);
    if (files.length === 0) return;
    setInstalling(true);
    try {
      await installLanguagePack({
        sourceFilePath: files[0],
        languageCode: code
      });
      toast.show({ title: `Language ${code} installed`, variant: "success" });
      await reload();
    } catch (e) {
      toast.show({
        title: "Install failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    } finally {
      setInstalling(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Language Manager"
        description="Install and manage Tesseract language packs."
        actions={<Button variant="outline" onClick={() => void reload()}>Refresh</Button>}
      />

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-xs">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <div>
          <div className="font-medium">Tessdata folder</div>
          <code className="mt-1 block break-all text-[11px] text-muted-foreground">
            {tessdataPath || "detecting…"}
          </code>
          <div className="mt-1 text-muted-foreground">
            Install new languages by picking a <code>.traineddata</code> file. Download official
            files from{" "}
            <a
              href="https://github.com/tesseract-ocr/tessdata_fast"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              tesseract-ocr/tessdata_fast
            </a>
            . Admin rights may be required to copy into tessdata.
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <ul className="divide-y divide-border">
          {languages.map((l) => (
            <li key={l.code} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">{l.name}</div>
                <div className="text-xs text-muted-foreground">{l.code}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={l.installed ? "success" : "secondary"}>
                  {l.installed ? "Installed" : "Not installed"}
                </Badge>
                {!l.installed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleInstall(l.code)}
                    disabled={installing}
                  >
                    <FolderInput className="h-3 w-3" /> Install
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageContainer>
  );
}