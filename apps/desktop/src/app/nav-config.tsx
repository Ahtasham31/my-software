import {
  ArrowRightLeft, Camera, FileImage, FileStack, FileText,
  FolderOpen, HardDrive, HelpCircle, History, Image as ImageIcon,
  LayoutDashboard, Layers, Printer, ScanLine, Settings, Sparkles,
  Type, Wrench
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  placeholder?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/files", label: "File & Project Manager", icon: FolderOpen },
      { to: "/activity", label: "Recent Activity", icon: History, placeholder: true }
    ]
  },
  {
    label: "Create",
    items: [
      { to: "/photo", label: "Photo Editing Studio", icon: ImageIcon },
      { to: "/photo/batch", label: "Batch Photo", icon: Sparkles },
      { to: "/passport", label: "Passport Photo Studio", icon: Camera },
      { to: "/passport/batch", label: "Batch Passport", icon: Sparkles },
      { to: "/ocr", label: "OCR Studio", icon: Type },
      { to: "/design", label: "Graphic Design Studio", icon: Layers, placeholder: true },
      { to: "/cards", label: "PVC & ID Card Studio", icon: FileStack, placeholder: true }
    ]
  },
  {
    label: "Documents",
    items: [
      { to: "/pdf", label: "PDF Professional Toolkit", icon: FileText, placeholder: true },
      { to: "/conversion", label: "Conversion Studio", icon: ArrowRightLeft, placeholder: true },
      { to: "/bulk", label: "Bulk Processing Studio", icon: Sparkles, placeholder: true }
    ]
  },
  {
    label: "Hardware",
    items: [
      { to: "/scanner", label: "Scanner Studio", icon: ScanLine, placeholder: true },
      { to: "/print", label: "Print Management Studio", icon: Printer, placeholder: true }
    ]
  },
  {
    label: "Content",
    items: [
      { to: "/templates", label: "Template & Asset Library", icon: FileImage, placeholder: true }
    ]
  },
  {
    label: "System",
    items: [
      { to: "/backup", label: "Backup & Recovery", icon: HardDrive, placeholder: true },
      { to: "/settings", label: "Settings", icon: Settings },
      { to: "/appearance", label: "Appearance", icon: Wrench },
      { to: "/help", label: "Help Center", icon: HelpCircle, placeholder: true }
    ]
  }
];

export const NAV_LOOKUP: Record<string, string> = NAV_GROUPS
  .flatMap((g) => g.items)
  .reduce<Record<string, string>>((acc, item) => {
    acc[item.to] = item.label;
    return acc;
  }, {});