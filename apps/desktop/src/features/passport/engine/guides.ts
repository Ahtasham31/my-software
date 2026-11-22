import type { GuideId } from "@/types/passport";

export const GUIDE_META: Record<GuideId, { label: string; color: string; horizontal: boolean }> = {
  headTop: { label: "Head top", color: "#ef4444", horizontal: true },
  eyeLine: { label: "Eye line", color: "#f59e0b", horizontal: true },
  chin: { label: "Chin", color: "#10b981", horizontal: true },
  shoulder: { label: "Shoulders", color: "#3b82f6", horizontal: true },
  faceCenter: { label: "Face center", color: "#8b5cf6", horizontal: false },
  safeMargin: { label: "Safe margin", color: "#6b7280", horizontal: false }
};

export function guideY(position: number, height: number): number {
  return position * height;
}

export function guideX(position: number, width: number): number {
  return position * width;
}