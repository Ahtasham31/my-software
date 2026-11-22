import { useCallback, useRef, useState } from "react";
import type { BrushOptions } from "@/types/photo";
import type { PhotoEditorApi } from "../hooks/use-photo-editor";
import { buildFilterCSS } from "../engine/image-engine";
import { maskFromEllipse, maskFromLasso, maskFromRect } from "../engine/selection-tools";
import { cn } from "@/lib/cn";

interface BrushApi {
  options: BrushOptions;
  beginStroke: (x: number, y: number) => void;
  continueStroke: (x: number, y: number) => void;
  endStroke: () => void;
  setCloneSource: (p: { x: number; y: number } | null) => void;
}

interface Props {
  editor: PhotoEditorApi;
  brush: BrushApi;
}

export function PhotoCanvas({ editor, brush }: Props): JSX.Element {
  const displayRef = useRef<HTMLCanvasElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [lassoPoints, setLassoPoints] = useState<[number, number][]>([]);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const drawImage = useCallback(
    (el: HTMLCanvasElement | null) => {
      if (!el || !editor.canvas) return;
      if (el.width !== editor.canvas.width || el.height !== editor.canvas.height) {
        el.width = editor.canvas.width;
        el.height = editor.canvas.height;
      }
      const ctx = el.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.drawImage(editor.canvas, 0, 0);
    },
    [editor.canvas, editor.version]
  );

  const canvasCallbackRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      (displayRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el;
      drawImage(el);
    },
    [drawImage]
  );

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!editor.canvas) return;
    const direction = e.deltaY > 0 ? 0.9 : 1.1;
    editor.setZoom(Math.max(0.05, Math.min(8, editor.zoom * direction)));
  };

  const screenToImage = (clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!displayRef.current) return null;
    const rect = displayRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * displayRef.current.width;
    const y = ((clientY - rect.top) / rect.height) * displayRef.current.height;
    return { x, y };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      setPanStart({ x: e.clientX - editor.pan.x, y: e.clientY - editor.pan.y });
      return;
    }
    const pt = screenToImage(e.clientX, e.clientY);
    if (!pt) return;

    if (e.altKey && editor.tool === "brush") {
      brush.setCloneSource(pt);
      return;
    }
    if (e.altKey) {
      setPanStart({ x: e.clientX - editor.pan.x, y: e.clientY - editor.pan.y });
      return;
    }

    if (editor.tool === "brush") {
      brush.beginStroke(pt.x, pt.y);
    } else if (editor.tool === "crop") {
      setDragStart(pt);
      editor.setCropRect({ x: pt.x, y: pt.y, w: 0, h: 0 });
    } else if (editor.tool === "magic-wand") {
      editor.selectAt(pt.x, pt.y);
    } else if (editor.tool === "rect-select" || editor.tool === "ellipse-select") {
      setSelectionStart(pt);
      setSelectionRect({ x: pt.x, y: pt.y, w: 0, h: 0 });
    } else if (editor.tool === "lasso") {
      setLassoPoints([[pt.x, pt.y]]);
    } else if (editor.tool === "pan") {
      setPanStart({ x: e.clientX - editor.pan.x, y: e.clientY - editor.pan.y });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (panStart) {
      editor.setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    const pt = screenToImage(e.clientX, e.clientY);
    if (!pt) return;

    if (editor.tool === "brush" && e.buttons === 1) {
      brush.continueStroke(pt.x, pt.y);
      return;
    }
    if (dragStart && editor.tool === "crop") {
      editor.setCropRect({
        x: Math.min(dragStart.x, pt.x),
        y: Math.min(dragStart.y, pt.y),
        w: Math.abs(pt.x - dragStart.x),
        h: Math.abs(pt.y - dragStart.y)
      });
      return;
    }
    if (selectionStart && selectionRect) {
      setSelectionRect({
        x: Math.min(selectionStart.x, pt.x),
        y: Math.min(selectionStart.y, pt.y),
        w: Math.abs(pt.x - selectionStart.x),
        h: Math.abs(pt.y - selectionStart.y)
      });
      return;
    }
    if (editor.tool === "lasso" && lassoPoints.length > 0 && e.buttons === 1) {
      setLassoPoints((prev) => [...prev, [pt.x, pt.y]]);
    }
  };

  const onMouseUp = () => {
    if (editor.tool === "brush") {
      brush.endStroke();
    }
    if (selectionStart && selectionRect && editor.canvas) {
      const tool = editor.tool;
      if (tool === "rect-select") {
        const mask = maskFromRect(
          editor.canvas.width,
          editor.canvas.height,
          selectionRect.x,
          selectionRect.y,
          selectionRect.w,
          selectionRect.h
        );
        editor.setSelectionMask(mask);
      } else if (tool === "ellipse-select") {
        const mask = maskFromEllipse(
          editor.canvas.width,
          editor.canvas.height,
          selectionRect.x + selectionRect.w / 2,
          selectionRect.y + selectionRect.h / 2,
          selectionRect.w / 2,
          selectionRect.h / 2
        );
        editor.setSelectionMask(mask);
      }
    }
    if (editor.tool === "lasso" && lassoPoints.length > 2 && editor.canvas) {
      const mask = maskFromLasso(editor.canvas.width, editor.canvas.height, lassoPoints);
      editor.setSelectionMask(mask);
    }
    setDragStart(null);
    setPanStart(null);
    setSelectionStart(null);
    setSelectionRect(null);
    setLassoPoints([]);
  };

  const filterCSS =
    editor.tool === "select" || editor.tool === "magic-wand"
      ? buildFilterCSS(editor.adjustments)
      : "none";

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[repeating-conic-gradient(#1a1a1a_0%_25%,#222_0%_50%)] bg-[length:20px_20px]"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {!editor.canvas ? (
        <div className="text-sm text-muted-foreground">No image loaded</div>
      ) : (
        <div
          className="relative"
          style={{
            transform: `translate(${editor.pan.x}px, ${editor.pan.y}px) scale(${editor.zoom})`,
            transformOrigin: "0 0",
            cursor:
              editor.tool === "crop"
                ? "crosshair"
                : editor.tool === "magic-wand"
                ? "cell"
                : editor.tool === "pan"
                ? "grab"
                : editor.tool === "brush"
                ? "crosshair"
                : "default"
          }}
        >
          <canvas
            ref={canvasCallbackRef}
            style={{
              filter: filterCSS,
              imageRendering: editor.zoom > 1 ? "pixelated" : "auto",
              maxWidth: "none"
            }}
          />
          {editor.cropRect && editor.tool === "crop" && (
            <div
              className="pointer-events-none absolute border-2 border-primary"
              style={{
                left: editor.cropRect.x,
                top: editor.cropRect.y,
                width: editor.cropRect.w,
                height: editor.cropRect.h,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)"
              }}
            />
          )}
          {selectionRect && (
            <div
              className={cn(
                "pointer-events-none absolute border-2 border-dashed border-primary",
                editor.tool === "ellipse-select" && "rounded-full"
              )}
              style={{
                left: selectionRect.x,
                top: selectionRect.y,
                width: selectionRect.w,
                height: selectionRect.h
              }}
            />
          )}
          {lassoPoints.length > 0 && editor.canvas && (
            <svg
              className="pointer-events-none absolute inset-0"
              width={editor.canvas.width}
              height={editor.canvas.height}
              style={{ overflow: "visible" }}
            >
              <polyline
                points={lassoPoints.map(([x, y]) => `${x},${y}`).join(" ")}
                fill="rgba(59,130,246,0.15)"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}