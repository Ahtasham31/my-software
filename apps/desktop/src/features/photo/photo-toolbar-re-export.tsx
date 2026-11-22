import { Download, FolderOpen, Redo2, RotateCcw, RotateCw, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import type { PhotoEditorApi } from "./hooks/use-photo-editor";

export function PhotoToolbar({ editor, onOpenImage }: { editor: PhotoEditorApi; onOpenImage: () => Promise<void> | void }): JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="outline" onClick={() => void onOpenImage()}>
        <FolderOpen className="h-3.5 w-3.5" /> Open
      </Button>
      <div className="mx-1 h-5 w-px bg-border" />
      <IconButton aria-label="Undo" onClick={editor.undo} disabled={!editor.canUndo}>
        <Undo2 className="h-4 w-4" />
      </IconButton>
      <IconButton aria-label="Redo" onClick={editor.redo} disabled={!editor.canRedo}>
        <Redo2 className="h-4 w-4" />
      </IconButton>
      <div className="mx-1 h-5 w-px bg-border" />
      <IconButton aria-label="Zoom out" onClick={editor.zoomOut}>
        <ZoomOut className="h-4 w-4" />
      </IconButton>
      <span className="min-w-[3rem] text-center text-xs text-muted-foreground">
        {Math.round(editor.zoom * 100)}%
      </span>
      <IconButton aria-label="Zoom in" onClick={editor.zoomIn}>
        <ZoomIn className="h-4 w-4" />
      </IconButton>
      <div className="mx-1 h-5 w-px bg-border" />
      <IconButton aria-label="Rotate left" onClick={() => editor.rotate(-90)}>
        <RotateCcw className="h-4 w-4" />
      </IconButton>
      <IconButton aria-label="Rotate right" onClick={() => editor.rotate(90)}>
        <RotateCw className="h-4 w-4" />
      </IconButton>
      <div className="ml-auto" />
      <Button size="sm" onClick={() => void editor.exportImage()} disabled={!editor.canvas || editor.busy}>
        <Download className="h-3.5 w-3.5" /> Export
      </Button>
    </div>
  );
}