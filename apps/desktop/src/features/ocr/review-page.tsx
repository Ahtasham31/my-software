import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/display";
import { useToast } from "@/components/ui/overlay";
import { saveDocx, saveText } from "@/services/ocr";
import { saveFileDialog } from "@/services/dialog";

const SAMPLE = `OCR review workspace.

Paste or open recognized text here to proofread. Undo/redo supported via browser shortcuts (Ctrl+Z / Ctrl+Y).

For Urdu / Arabic, use the RTL toggle. Save as TXT or DOCX.`;

export function ReviewPage(): JSX.Element {
  const toast = useToast();
  const [text, setText] = useState(SAMPLE);
  const [rtl, setRtl] = useState(false);

  const handleSaveTxt = async () => {
    const target = await saveFileDialog("review.txt", [["Text", "txt"]]);
    if (!target) return;
    try {
      await saveText(target, text);
      toast.show({ title: "Saved", variant: "success" });
    } catch (e) {
      toast.show({
        title: "Save failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    }
  };

  const handleSaveDocx = async () => {
    const target = await saveFileDialog("review.docx", [["Word", "docx"]]);
    if (!target) return;
    try {
      await saveDocx(target, [text], rtl);
      toast.show({ title: "Saved", variant: "success" });
    } catch (e) {
      toast.show({
        title: "Save failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Review & Correct"
        description="Proofread OCR output before exporting."
      />

      <div className="mb-3 flex items-center gap-2">
        <Badge variant={rtl ? "default" : "outline"}>{rtl ? "RTL" : "LTR"}</Badge>
        <Button size="sm" variant="outline" onClick={() => setRtl((v) => !v)}>
          Toggle direction
        </Button>
        <span className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => void handleSaveTxt()}>Save TXT</Button>
        <Button size="sm" variant="outline" onClick={() => void handleSaveDocx()}>Save DOCX</Button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="h-[60vh] w-full resize-none rounded-lg border border-border bg-card p-4 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        dir={rtl ? "rtl" : "ltr"}
        style={{ fontFamily: rtl ? '"Noto Nastaliq Urdu", serif' : undefined }}
      />
    </PageContainer>
  );
}