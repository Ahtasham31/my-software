import { useCallback, useRef, useState } from "react";
import { GuidesOverlay } from "./guides-overlay";
import type { PassportStudioApi } from "../hooks/use-passport-studio";

interface Props {
  studio: PassportStudioApi;
}

export function PassportCanvas({ studio }: Props): JSX.Element {
  const { preview, settings, setSettings, sourceCanvas, bgTool } = studio;
  const guides = settings.guides;
  const displayRef = useRef<HTMLCanvasElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [guideDrag, setGuideDrag] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [erasing, setErasing] = useState(false);

  const canvasCallbackRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      (displayRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el;
      if (!el || !preview) return;
      if (el.width !== preview.width || el.height !== preview.height) {
        el.width = preview.width;
        el.height = preview.height;
      }
      const ctx = el.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.drawImage(preview, 0, 0);
    },
    [preview]
  );

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      setZoom((z) => Math.max(0.3, Math.min(3, z * (e.deltaY > 0 ? 0.9 : 1.1))));
    } else {
      const delta = e.deltaY > 0 ? -0.02 : 0.02;
      setSettings({ ...settings, scale: Math.max(0.2, settings.scale + delta) });
    }
  };

  const clientToImage = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const rect = displayRef.current?.getBoundingClientRect();
    if (!rect || !preview) return null;
    const mx = ((clientX - rect.left) / rect.width) * preview.width;
    const my = ((clientY - rect.top) / rect.height) * preview.height;
    // Convert back to source image coords for background pick
    if (!sourceCanvas) return { x: mx, y: my };
    const scaleToFill = Math.max(preview.width / sourceCanvas.width, preview.height / sourceCanvas.height);
    const drawW = sourceCanvas.width * scaleToFill * settings.scale;
    const drawH = sourceCanvas.height * scaleToFill * settings.scale;
    const cx = preview.width / 2 + settings.offsetX;
    const cy = preview.height / 2 + settings.offsetY;
    const rot = (-settings.rotation * Math.PI) / 180;
    const dx = mx - cx;
    const dy = my - cy;
    const rx = dx * Math.cos(rot) - dy * Math.sin(rot);
    const ry = dx * Math.sin(rot) + dy * Math.cos(rot);
    const sx = ((rx + drawW / 2) / drawW) * sourceCanvas.width;
    const sy = ((ry + drawH / 2) / drawH) * sourceCanvas.height;
    return { x: sx, y: sy };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (settings.backgroundRemoval.enabled) {
      const pt = clientToImage(e.clientX, e.clientY);
      if (!pt) return;
      if (bgTool === "magic-wand") {
        studio.pickBgAt(pt.x, pt.y);
        return;
      }
      if (bgTool === "brush-eraser") {
        setErasing(true);
        studio.eraseAt(pt.x, pt.y, 30);
        return;
      }
    }

    const rect = displayRef.current?.getBoundingClientRect();
    if (!rect || !preview) return;
    const mx = ((e.clientX - rect.left) / rect.width) * preview.width;
    const my = ((e.clientY - rect.top) / rect.height) * preview.height;

    for (const g of guides) {
      if (!g.enabled) continue;
      const isHorizontal = ["headTop", "eyeLine", "chin", "shoulder"].includes(g.id);
      if (isHorizontal) {
        const y = g.position * preview.height;
        if (Math.abs(my - y) < 8) {
          setGuideDrag(g.id);
          return;
        }
      } else {
        const x = g.position * preview.width;
        if (Math.abs(mx - x) < 8) {
          setGuideDrag(g.id);
          return;
        }
      }
    }

    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: settings.offsetX, y: settings.offsetY });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (erasing && sourceCanvas) {
      const pt = clientToImage(e.clientX, e.clientY);
      if (pt) studio.eraseAt(pt.x, pt.y, 30);
      return;
    }
    if (guideDrag && preview) {
      const rect = displayRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = ((e.clientX - rect.left) / rect.width) * preview.width;
      const my = ((e.clientY - rect.top) / rect.height) * preview.height;
      const isHorizontal = ["headTop", "eyeLine", "chin", "shoulder"].includes(guideDrag);
      const pos = isHorizontal
        ? Math.max(0, Math.min(1, my / preview.height))
        : Math.max(0, Math.min(1, mx / preview.width));
      setSettings({
        ...settings,
        guides: settings.guides.map((g) =>
          g.id === guideDrag ? { ...g, position: pos } : g
        )
      });
      return;
    }
    if (!dragStart || !dragOffset) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setSettings({
      ...settings,
      offsetX: dragOffset.x + dx,
      offsetY: dragOffset.y + dy
    });
  };

  const onMouseUp = () => {
    setDragStart(null);
    setDragOffset(null);
    setGuideDrag(null);
    setErasing(false);
  };

  const cursor =
    settings.backgroundRemoval.enabled
      ? bgTool === "magic-wand"
        ? "cell"
        : "crosshair"
      : dragStart
      ? "grabbing"
      : "grab";

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px]"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {!preview ? (
        <div className="text-sm text-muted-foreground">Import a photo to begin.</div>
      ) : (
        <div
          className="relative shadow-lg"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center",
            cursor
          }}
        >
          <canvas ref={canvasCallbackRef} className="block" />
          <GuidesOverlay guides={guides} width={preview.width} height={preview.height} />
          <div className="pointer-events-none absolute inset-0 border-2 border-primary/40" />
        </div>
      )}
    </div>
  );
}