import { useCallback, useEffect, useRef, useState } from "react";
import type { PassportPreset, PassportSettings, BgRemovalTool } from "@/types/passport";
import { BACKGROUND_PRESETS, DEFAULT_SETTINGS, presetToPx } from "@/types/passport";
import { builtinPresets, findPreset } from "../engine/presets";
import { makeBackground } from "../engine/background";
import { loadPhotoImage, saveFileDialog } from "@/services/photo";
import { openFileDialog } from "@/services/dialog";
import { saveDataUrl } from "@/services/passport";
import { bakeAdjustments } from "@/features/photo/engine/image-engine";
import { floodSelect } from "@/features/photo/engine/magic-wand";
import { featherMask } from "@/features/photo/engine/selection-tools";

import { customToPreset, parseCustomBgId } from "../engine/background";
import type { CustomBackground } from "@/types/passport";

export interface PassportStudioApi {
  presets: PassportPreset[];
  settings: PassportSettings;
  sourceCanvas: HTMLCanvasElement | null;
  sourcePath: string | null;
  sourceName: string;
  preview: HTMLCanvasElement | null;
  sourceOriginal: HTMLCanvasElement | null;
  busy: boolean;
  bgTool: BgRemovalTool;
  hasMask: boolean;

  selectPreset: (id: string) => void;
  setSettings: (s: PassportSettings) => void;
  importImage: () => Promise<void>;
  importImageFromPath: (path: string) => Promise<void>;
  toggleGuide: (id: string) => void;
  moveGuide: (id: string, position: number) => void;
  fitToFrame: () => void;
  resetAll: () => void;
  exportPhoto: () => Promise<void>;
  exportSheet: (sheetCanvas: HTMLCanvasElement, label: string) => Promise<void>;
  refreshPreview: () => void;
  setPresets: (p: PassportPreset[]) => void;
  setBgTool: (t: BgRemovalTool) => void;
  pickBgAt: (x: number, y: number) => void;
  eraseAt: (x: number, y: number, radius: number) => void;
  clearMask: () => void;
  applyMask: () => void;
  toggleBeforeAfter: () => void;
  showBeforeAfter: boolean;
}

export function usePassportStudio(): PassportStudioApi {
  const [presets, setPresets] = useState<PassportPreset[]>(builtinPresets());
  const [settings, setSettings] = useState<PassportSettings>({
    ...DEFAULT_SETTINGS,
    presetId: "passport-35x45"
  });
  const [sourceCanvas, setSourceCanvas] = useState<HTMLCanvasElement | null>(null);
  const [sourceOriginal, setSourceOriginal] = useState<HTMLCanvasElement | null>(null);
  const [sourcePath, setSourcePath] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("Untitled");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<HTMLCanvasElement | null>(null);
  const [bgTool, setBgTool] = useState<BgRemovalTool>("magic-wand");
  const [hasMask, setHasMask] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  const sourceRef = useRef<HTMLCanvasElement | null>(null);
  const originalRef = useRef<HTMLCanvasElement | null>(null);
  const maskRef = useRef<Uint8Array | null>(null);

  sourceRef.current = sourceCanvas;
  originalRef.current = sourceOriginal;

  const refreshPreview = useCallback(() => {
    const preset = findPreset(presets, settings.presetId);
    if (!preset || !sourceRef.current) {
      setPreview(null);
      return;
    }
    const { width, height } = presetToPx(preset);
    const out = document.createElement("canvas");
    out.width = width;
    out.height = height;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    const resolveBg = (id: string) => {
  const builtin = BACKGROUND_PRESETS.find((b) => b.id === id);
  if (builtin) return builtin;
  if (id.startsWith("custom:#")) {
    const color = id.slice("custom:".length);
    return { id, label: "Custom", kind: "solid" as const, color };
  }
  const customId = parseCustomBgId(id);
  if (customId) {
    const custom = (window as unknown as { __passportCustomBgs?: CustomBackground[] })
      .__passportCustomBgs?.find((c) => c.id === customId);
    if (custom) return customToPreset(custom);
  }
  return BACKGROUND_PRESETS[0];
};

const bg = resolveBg(settings.bg);
    const bgCanvas = makeBackground(width, height, bg);
    ctx.drawImage(bgCanvas, 0, 0);

    const src = sourceRef.current;
    let drawSource: HTMLCanvasElement = src;

    if (settings.backgroundRemoval.enabled && maskRef.current) {
      const tmp = document.createElement("canvas");
      tmp.width = src.width;
      tmp.height = src.height;
      const tctx = tmp.getContext("2d");
      if (tctx) {
        tctx.drawImage(src, 0, 0);
        const img = tctx.getImageData(0, 0, tmp.width, tmp.height);
        const d = img.data;
        const mask = maskRef.current;
        for (let i = 0; i < mask.length; i++) {
          if (mask[i]) d[i * 4 + 3] = 0;
        }
        tctx.putImageData(img, 0, 0);
        drawSource = tmp;
      }
    }

    const srcW = drawSource.width;
    const srcH = drawSource.height;
    const scaleToFill = Math.max(width / srcW, height / srcH);
    const drawW = srcW * scaleToFill * settings.scale;
    const drawH = srcH * scaleToFill * settings.scale;

    ctx.save();
    ctx.translate(width / 2 + settings.offsetX, height / 2 + settings.offsetY);
    ctx.rotate((settings.rotation * Math.PI) / 180);
    ctx.drawImage(drawSource, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    const adj = {
      brightness: settings.brightness,
      contrast: settings.contrast,
      saturate: settings.saturate,
      hue: 0,
      exposure: settings.exposure,
      temperature: settings.temperature,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      vibrance: 0,
      gamma: 1,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0
    };
    let adjusted = bakeAdjustments(out, adj);
    if (settings.noiseReduce > 0) adjusted = medianFilter(adjusted, Math.ceil(settings.noiseReduce));
    if (settings.sharpness > 0) adjusted = unsharp(adjusted, settings.sharpness);

    setPreview(adjusted);
  }, [presets, settings]);

  useEffect(() => {
    refreshPreview();
  }, [refreshPreview]);

  const selectPreset = useCallback((id: string) => {
    setSettings((prev) => ({ ...prev, presetId: id }));
  }, []);

  const importImageFromPath = useCallback(async (path: string) => {
    setBusy(true);
    try {
      const loaded = await loadPhotoImage(path);
      const img = new Image();
      img.src = loaded.dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to decode"));
      });
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")?.drawImage(img, 0, 0);
      setSourceCanvas(c);
      const original = document.createElement("canvas");
      original.width = c.width;
      original.height = c.height;
      original.getContext("2d")?.drawImage(c, 0, 0);
      setSourceOriginal(original);
      maskRef.current = null;
      setHasMask(false);
      setSourcePath(loaded.path);
      setSourceName(loaded.name);
    } finally {
      setBusy(false);
    }
  }, []);

  const importImage = useCallback(async () => {
    const files = await openFileDialog(false);
    if (files.length === 0) return;
    await importImageFromPath(files[0]);
  }, [importImageFromPath]);

  const toggleGuide = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      guides: prev.guides.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g))
    }));
  }, []);

  const moveGuide = useCallback((id: string, position: number) => {
    setSettings((prev) => ({
      ...prev,
      guides: prev.guides.map((g) => (g.id === id ? { ...g, position } : g))
    }));
  }, []);

  const fitToFrame = useCallback(() => {
    setSettings((prev) => ({ ...prev, offsetX: 0, offsetY: 0, scale: 1, rotation: 0 }));
  }, []);

  const resetAll = useCallback(() => {
    setSettings((prev) => ({ ...DEFAULT_SETTINGS, presetId: prev.presetId, guides: prev.guides }));
  }, []);

  const pickBgAt = useCallback(
    (x: number, y: number) => {
      const src = originalRef.current;
      if (!src) return;
      const ctx = src.getContext("2d");
      if (!ctx) return;
      if (x < 0 || x >= src.width || y < 0 || y >= src.height) return;
      const data = ctx.getImageData(0, 0, src.width, src.height);
      let mask = floodSelect(data, Math.floor(x), Math.floor(y), settings.backgroundRemoval.tolerance);
      if (settings.backgroundRemoval.feather > 0) {
        mask = featherMask(
          mask,
          src.width,
          src.height,
          Math.ceil(settings.backgroundRemoval.feather)
        );
      }
      maskRef.current = mask;
      setHasMask(true);
      setSettings((prev) => ({
        ...prev,
        backgroundRemoval: { ...prev.backgroundRemoval, enabled: true }
      }));
    },
    [settings.backgroundRemoval.tolerance, settings.backgroundRemoval.feather]
  );

  const eraseAt = useCallback((x: number, y: number, radius: number) => {
    const src = originalRef.current;
    if (!src) return;
    let mask = maskRef.current;
    if (!mask) mask = new Uint8Array(src.width * src.height);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = Math.floor(x + dx);
        const py = Math.floor(y + dy);
        if (px < 0 || px >= src.width || py < 0 || py >= src.height) continue;
        if (dx * dx + dy * dy <= radius * radius) {
          mask[py * src.width + px] = 1;
        }
      }
    }
    maskRef.current = mask;
    setHasMask(true);
    setSettings((prev) => ({
      ...prev,
      backgroundRemoval: { ...prev.backgroundRemoval, enabled: true }
    }));
  }, []);

  const clearMask = useCallback(() => {
    maskRef.current = null;
    setHasMask(false);
    setSettings((prev) => ({
      ...prev,
      backgroundRemoval: { ...prev.backgroundRemoval, enabled: false }
    }));
  }, []);

  const applyMask = useCallback(() => {
    refreshPreview();
  }, [refreshPreview]);

  const exportPhoto = useCallback(async () => {
    if (!preview) return;
    const target = await saveFileDialog(
      `${sourceName.replace(/\.[^.]+$/, "")}_passport.png`,
      [["PNG", "png"], ["JPEG", "jpg", "jpeg"]]
    );
    if (!target) return;
    const ext = target.split(".").pop()?.toLowerCase();
    const dataUrl =
      ext === "jpg" || ext === "jpeg"
        ? preview.toDataURL("image/jpeg", 0.95)
        : preview.toDataURL("image/png");
    setBusy(true);
    try {
      await saveDataUrl(target, dataUrl);
    } finally {
      setBusy(false);
    }
  }, [preview, sourceName]);

  const exportSheet = useCallback(
    async (sheetCanvas: HTMLCanvasElement, label: string) => {
      const target = await saveFileDialog(`${label}.png`, [["PNG", "png"]]);
      if (!target) return;
      const dataUrl = sheetCanvas.toDataURL("image/png");
      setBusy(true);
      try {
        await saveDataUrl(target, dataUrl);
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const toggleBeforeAfter = useCallback(() => setShowBeforeAfter((v) => !v), []);

  return {
    presets,
    settings,
    sourceCanvas,
    sourcePath,
    sourceName,
    preview,
    sourceOriginal,
    busy,
    bgTool,
    hasMask,
    selectPreset,
    setSettings,
    importImage,
    importImageFromPath,
    toggleGuide,
    moveGuide,
    fitToFrame,
    resetAll,
    exportPhoto,
    exportSheet,
    refreshPreview,
    setPresets,
    setBgTool,
    pickBgAt,
    eraseAt,
    clearMask,
    applyMask,
    toggleBeforeAfter,
    showBeforeAfter
  };
}

function medianFilter(src: HTMLCanvasElement, radius: number): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d");
  if (!ctx) return out;
  ctx.drawImage(src, 0, 0);
  const id = ctx.getImageData(0, 0, out.width, out.height);
  const s = id.data;
  const dst = new ImageData(out.width, out.height);
  const d = dst.data;
  const w = out.width;
  const h = out.height;
  const win: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      win.length = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const px = Math.min(w - 1, Math.max(0, x + dx));
          const py = Math.min(h - 1, Math.max(0, y + dy));
          win.push(s[(py * w + px) * 4]);
        }
      }
      win.sort((a, b) => a - b);
      const median = win[Math.floor(win.length / 2)];
      const idx = (y * w + x) * 4;
      d[idx] = median;
      d[idx + 1] = median;
      d[idx + 2] = median;
      d[idx + 3] = s[idx + 3];
    }
  }
  ctx.putImageData(dst, 0, 0);
  return out;
}

function unsharp(src: HTMLCanvasElement, amount: number): HTMLCanvasElement {
  const blurred = document.createElement("canvas");
  blurred.width = src.width;
  blurred.height = src.height;
  const bctx = blurred.getContext("2d");
  if (!bctx) return src;
  bctx.filter = "blur(1.5px)";
  bctx.drawImage(src, 0, 0);

  const b = bctx.getImageData(0, 0, blurred.width, blurred.height).data;
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const octx = out.getContext("2d");
  if (!octx) return src;
  octx.drawImage(src, 0, 0);
  const oid = octx.getImageData(0, 0, out.width, out.height);
  const d = oid.data;
  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      d[i + c] = Math.max(0, Math.min(255, d[i + c] + (d[i + c] - b[i + c]) * amount));
    }
  }
  octx.putImageData(oid, 0, 0);
  return out;
}