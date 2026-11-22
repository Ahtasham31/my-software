import { useCallback, useRef, useState } from "react";
import type { BrushOptions } from "@/types/photo";
import { DEFAULT_BRUSH } from "@/types/photo";
import { paintDab } from "../engine/brush-tools";

export function useBrushTool(
  canvas: HTMLCanvasElement | null,
  onCommit: (canvas: HTMLCanvasElement, description: string) => void
) {
  const [options, setOptions] = useState<BrushOptions>(DEFAULT_BRUSH);
  const [cloneSource, setCloneSourceState] = useState<{ x: number; y: number } | null>(null);
  const paintingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pendingRef = useRef<HTMLCanvasElement | null>(null);

  const beginStroke = useCallback(
    (x: number, y: number) => {
      if (!canvas) return;
      pendingRef.current = document.createElement("canvas");
      pendingRef.current.width = canvas.width;
      pendingRef.current.height = canvas.height;
      pendingRef.current.getContext("2d")?.drawImage(canvas, 0, 0);
      sourceCanvasRef.current = pendingRef.current;
      paintingRef.current = true;
      lastPointRef.current = { x, y };
      const ctx = canvas.getContext("2d");
      if (ctx) paintDab(ctx, x, y, options, sourceCanvasRef.current, cloneSource);
    },
    [canvas, options, cloneSource]
  );

  const continueStroke = useCallback(
    (x: number, y: number) => {
      if (!paintingRef.current || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const last = lastPointRef.current ?? { x, y };
      const steps = Math.max(1, Math.floor(Math.hypot(x - last.x, y - last.y) / 2));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const px = last.x + (x - last.x) * t;
        const py = last.y + (y - last.y) * t;
        paintDab(ctx, px, py, options, sourceCanvasRef.current, cloneSource);
      }
      lastPointRef.current = { x, y };
    },
    [canvas, options, cloneSource]
  );

  const endStroke = useCallback(() => {
    if (!paintingRef.current || !canvas) {
      paintingRef.current = false;
      return;
    }
    paintingRef.current = false;
    lastPointRef.current = null;
    onCommit(canvas, `Brush: ${options.kind}`);
  }, [canvas, options.kind, onCommit]);

  const setCloneSource = useCallback((pt: { x: number; y: number } | null) => {
    setCloneSourceState(pt);
  }, []);

  return {
    options,
    setOptions,
    cloneSource,
    setCloneSource,
    beginStroke,
    continueStroke,
    endStroke
  };
}