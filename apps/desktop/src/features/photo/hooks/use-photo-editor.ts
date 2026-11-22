import { useCallback, useRef, useState } from "react";
import type {
  Adjustments,
  FilterId,
  HistoryEntry,
  PhotoTool,
  Rect
} from "@/types/photo";
import { DEFAULT_ADJUSTMENTS } from "@/types/photo";
import {
  applyFilterToCanvas,
  applyGamma,
  applyHighlightsShadows,
  applyVibrance,
  bakeAdjustments,
  cloneCanvas,
  cropCanvas,
  fillMask,
  imageToCanvas,
  makeTransparent,
  resizeCanvas,
  rotateCanvas
} from "../engine/image-engine";
import { floodSelect } from "../engine/magic-wand";
import { applyWatermark, type WatermarkOptions } from "../engine/watermark";
import { loadPhotoImage, saveFileDialog, savePhotoImage } from "@/services/photo";
import { openFileDialog } from "@/services/dialog";

const MAX_HISTORY = 20;

export interface PhotoEditorApi {
  canvas: HTMLCanvasElement | null;
  version: number;
  width: number;
  height: number;
  name: string;
  sourcePath: string | null;
  zoom: number;
  pan: { x: number; y: number };
  tool: PhotoTool;
  adjustments: Adjustments;
  cropRect: Rect | null;
  selectionMask: Uint8Array | null;
  tolerance: number;
  feather: number;
  busy: boolean;
  canUndo: boolean;
  canRedo: boolean;

  openImage: () => Promise<void>;
  loadImageFromPath: (path: string) => Promise<void>;
  setTool: (t: PhotoTool) => void;
  setZoom: (z: number) => void;
  setPan: (p: { x: number; y: number }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  actualSize: () => void;
  setAdjustments: (a: Adjustments) => void;
  resetAdjustments: () => void;
  applyAdjustments: () => void;
  applyFilter: (id: FilterId) => void;
  setCropRect: (r: Rect | null) => void;
  applyCrop: () => void;
  cancelCrop: () => void;
  resize: (w: number, h: number) => void;
  rotate: (deg: number) => void;
  selectAt: (x: number, y: number) => void;
  setSelectionMask: (m: Uint8Array | null) => void;
  applySelectionTransparent: () => void;
  applySelectionFill: (color: string) => void;
  clearSelection: () => void;
  setTolerance: (t: number) => void;
  setFeather: (f: number) => void;
  applyWatermark: (opts: WatermarkOptions) => void;
  commit: (next: HTMLCanvasElement, description: string) => void;
  replaceCanvas: (next: HTMLCanvasElement) => void;
  undo: () => void;
  redo: () => void;
  exportImage: () => Promise<void>;
  exportTo: (path: string) => Promise<void>;
}

export function usePhotoEditor(): PhotoEditorApi {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [version, setVersion] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [name, setName] = useState("Untitled");
  const [sourcePath, setSourcePath] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<PhotoTool>("select");
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [cropRect, setCropRect] = useState<Rect | null>(null);
  const [selectionMask, setSelectionMask] = useState<Uint8Array | null>(null);
  const [tolerance, setTolerance] = useState(30);
  const [feather, setFeather] = useState(0);
  const [busy, setBusy] = useState(false);

  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [historyVersion, setHistoryVersion] = useState(0);

  const bump = useCallback((newCanvas: HTMLCanvasElement) => {
    setCanvas(newCanvas);
    setWidth(newCanvas.width);
    setHeight(newCanvas.height);
    setVersion((v) => v + 1);
  }, []);

  const pushHistory = useCallback(
    (entry: HistoryEntry) => {
      const arr = historyRef.current.slice(0, historyIndexRef.current + 1);
      arr.push(entry);
      while (arr.length > MAX_HISTORY) arr.shift();
      historyRef.current = arr;
      historyIndexRef.current = arr.length - 1;
      setHistoryVersion((v) => v + 1);
    },
    []
  );

  const commit = useCallback(
    (nextCanvas: HTMLCanvasElement, description: string) => {
      pushHistory({
        name: description,
        canvas: cloneCanvas(nextCanvas),
        width: nextCanvas.width,
        height: nextCanvas.height
      });
      bump(nextCanvas);
    },
    [bump, pushHistory]
  );

  const replaceCanvas = useCallback(
    (next: HTMLCanvasElement) => {
      pushHistory({
        name: "Restored",
        canvas: cloneCanvas(next),
        width: next.width,
        height: next.height
      });
      bump(next);
    },
    [bump, pushHistory]
  );

  const loadImageFromPath = useCallback(
    async (path: string) => {
      setBusy(true);
      try {
        const loaded = await loadPhotoImage(path);
        const img = new Image();
        img.src = loaded.dataUrl;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to decode image"));
        });
        const c = imageToCanvas(img);
        historyRef.current = [];
        historyIndexRef.current = -1;
        pushHistory({
          name: "Open",
          canvas: cloneCanvas(c),
          width: c.width,
          height: c.height
        });
        bump(c);
        setName(loaded.name);
        setSourcePath(loaded.path);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setAdjustments(DEFAULT_ADJUSTMENTS);
        setCropRect(null);
        setSelectionMask(null);
      } finally {
        setBusy(false);
      }
    },
    [bump, pushHistory]
  );

  const openImage = useCallback(async () => {
    const files = await openFileDialog(false);
    if (files.length === 0) return;
    await loadImageFromPath(files[0]);
  }, [loadImageFromPath]);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(8, z * 1.25)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.05, z / 1.25)), []);
  const fitToScreen = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);
  const actualSize = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const resetAdjustments = useCallback(() => setAdjustments(DEFAULT_ADJUSTMENTS), []);

  const applyAdjustments = useCallback(() => {
    if (!canvas) return;
    let next = bakeAdjustments(canvas, adjustments);
    if (adjustments.highlights !== 0 || adjustments.shadows !== 0 || adjustments.whites !== 0 || adjustments.blacks !== 0) {
      next = applyHighlightsShadows(
        next,
        adjustments.highlights,
        adjustments.shadows,
        adjustments.whites,
        adjustments.blacks
      );
    }
    if (adjustments.vibrance !== 0) next = applyVibrance(next, adjustments.vibrance);
    if (adjustments.gamma !== 1) next = applyGamma(next, adjustments.gamma);
    commit(next, "Adjustments");
    setAdjustments(DEFAULT_ADJUSTMENTS);
  }, [canvas, adjustments, commit]);

  const applyFilter = useCallback(
    (id: FilterId) => {
      if (!canvas) return;
      const next = applyFilterToCanvas(canvas, id);
      commit(next, `Filter: ${id}`);
    },
    [canvas, commit]
  );

  const applyCrop = useCallback(() => {
    if (!canvas || !cropRect || cropRect.w < 1 || cropRect.h < 1) return;
    const next = cropCanvas(canvas, cropRect);
    commit(next, "Crop");
    setCropRect(null);
    setTool("select");
  }, [canvas, cropRect, commit]);

  const cancelCrop = useCallback(() => {
    setCropRect(null);
    setTool("select");
  }, []);

  const resize = useCallback(
    (w: number, h: number) => {
      if (!canvas || w < 1 || h < 1) return;
      const next = resizeCanvas(canvas, w, h);
      commit(next, `Resize ${w}×${h}`);
    },
    [canvas, commit]
  );

  const rotate = useCallback(
    (deg: number) => {
      if (!canvas) return;
      const next = rotateCanvas(canvas, deg);
      commit(next, `Rotate ${deg}°`);
    },
    [canvas, commit]
  );

  const selectAt = useCallback(
    (x: number, y: number) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const mask = floodSelect(data, Math.floor(x), Math.floor(y), tolerance);
      setSelectionMask(mask);
    },
    [canvas, tolerance]
  );

  const applySelectionTransparent = useCallback(() => {
    if (!canvas || !selectionMask) return;
    const next = makeTransparent(canvas, selectionMask);
    commit(next, "Background removed");
    setSelectionMask(null);
  }, [canvas, selectionMask, commit]);

  const applySelectionFill = useCallback(
    (color: string) => {
      if (!canvas || !selectionMask) return;
      const next = fillMask(canvas, selectionMask, color);
      commit(next, "Background filled");
      setSelectionMask(null);
    },
    [canvas, selectionMask, commit]
  );

  const clearSelection = useCallback(() => setSelectionMask(null), []);

  const doApplyWatermark = useCallback(
    (opts: WatermarkOptions) => {
      if (!canvas) return;
      const next = applyWatermark(canvas, opts);
      commit(next, "Watermark");
    },
    [canvas, commit]
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const entry = historyRef.current[historyIndexRef.current];
    bump(cloneCanvas(entry.canvas));
    setHistoryVersion((v) => v + 1);
  }, [bump]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const entry = historyRef.current[historyIndexRef.current];
    bump(cloneCanvas(entry.canvas));
    setHistoryVersion((v) => v + 1);
  }, [bump]);

  const exportTo = useCallback(
    async (target: string) => {
      if (!canvas) return;
      const ext = target.split(".").pop()?.toLowerCase() ?? "png";
      let dataUrl: string;
      if (ext === "jpg" || ext === "jpeg") {
        dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      } else if (ext === "webp") {
        dataUrl = canvas.toDataURL("image/webp", 0.92);
      } else {
        dataUrl = canvas.toDataURL("image/png");
      }
      setBusy(true);
      try {
        await savePhotoImage(target, dataUrl);
      } finally {
        setBusy(false);
      }
    },
    [canvas]
  );

  const exportImage = useCallback(async () => {
    if (!canvas) return;
    const target = await saveFileDialog(name.replace(/\.[^.]+$/, "") + ".png", [
      ["PNG", "png"],
      ["JPEG", "jpg", "jpeg"],
      ["WebP", "webp"],
      ["BMP", "bmp"]
    ]);
    if (!target) return;
    await exportTo(target);
  }, [canvas, name, exportTo]);

  void historyVersion;

  return {
    canvas,
    version,
    width,
    height,
    name,
    sourcePath,
    zoom,
    pan,
    tool,
    adjustments,
    cropRect,
    selectionMask,
    tolerance,
    feather,
    busy,
    canUndo: historyIndexRef.current > 0,
    canRedo: historyIndexRef.current < historyRef.current.length - 1,
    openImage,
    loadImageFromPath,
    setTool,
    setZoom,
    setPan,
    zoomIn,
    zoomOut,
    fitToScreen,
    actualSize,
    setAdjustments,
    resetAdjustments,
    applyAdjustments,
    applyFilter,
    setCropRect,
    applyCrop,
    cancelCrop,
    resize,
    rotate,
    selectAt,
    setSelectionMask,
    applySelectionTransparent,
    applySelectionFill,
    clearSelection,
    setTolerance,
    setFeather,
    applyWatermark: doApplyWatermark,
    commit,
    replaceCanvas,
    undo,
    redo,
    exportImage,
    exportTo
  };
}