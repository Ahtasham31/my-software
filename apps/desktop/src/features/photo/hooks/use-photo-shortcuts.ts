import { useEffect } from "react";
import type { PhotoEditorApi } from "./use-photo-editor";

export function usePhotoShortcuts(editor: PhotoEditorApi): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === "o") {
        e.preventDefault();
        void editor.openImage();
      } else if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        editor.undo();
      } else if ((mod && e.key.toLowerCase() === "y") || (mod && e.shiftKey && e.key.toLowerCase() === "z")) {
        e.preventDefault();
        editor.redo();
      } else if (mod && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        editor.zoomIn();
      } else if (mod && e.key === "-") {
        e.preventDefault();
        editor.zoomOut();
      } else if (mod && e.key === "0") {
        e.preventDefault();
        editor.fitToScreen();
      } else if (mod && e.key === "1") {
        e.preventDefault();
        editor.actualSize();
      } else if (e.key === "Escape") {
        editor.cancelCrop();
        editor.clearSelection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor]);
}

export const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: "Ctrl+O", action: "Open image" },
  { keys: "Ctrl+Z", action: "Undo" },
  { keys: "Ctrl+Y / Ctrl+Shift+Z", action: "Redo" },
  { keys: "Ctrl++", action: "Zoom in" },
  { keys: "Ctrl+-", action: "Zoom out" },
  { keys: "Ctrl+0", action: "Fit to screen" },
  { keys: "Ctrl+1", action: "Actual size" },
  { keys: "Escape", action: "Cancel operation" }
];