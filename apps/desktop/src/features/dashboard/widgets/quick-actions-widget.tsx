import { useNavigate } from "react-router-dom";
import {
  FolderOpen, FilePlus2, ImagePlus, ScanLine, ArrowRightLeft, FileText
} from "lucide-react";

const ACTIONS = [
  { label: "New Project", icon: FilePlus2, to: "/projects/new", active: true },
  { label: "Open File Manager", icon: FolderOpen, to: "/files", active: true },
  { label: "Import Files", icon: ImagePlus, to: "/files?action=import", active: true },
  { label: "Photo Studio", icon: ImagePlus, to: "/photo", active: false },
  { label: "OCR Studio", icon: ScanLine, to: "/ocr", active: false },
  { label: "Convert File", icon: ArrowRightLeft, to: "/conversion", active: false },
  { label: "PDF Toolkit", icon: FileText, to: "/pdf", active: false },
];

export function QuickActionsWidget(): JSX.Element {
  const navigate = useNavigate();
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-card-heading">Quick actions</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            disabled={!a.active}
            onClick={() => a.active && navigate(a.to)}
            title={!a.active ? "Not available yet" : a.label}
            className="flex flex-col items-center gap-1 rounded-md border border-border p-2 text-xs hover:bg-hover disabled:opacity-50"
          >
            <a.icon className="h-4 w-4 text-primary" />
            <span className="text-center">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}