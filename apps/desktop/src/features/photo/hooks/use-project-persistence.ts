import type { Layer } from "@/types/photo-layers";
import { isImageLayer } from "@/types/photo-layers";

interface SerializedLayer {
  id: string;
  kind: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
  locked: boolean;
  x: number;
  y: number;
  rotation: number;
  // image-only
  dataUrl?: string;
  width?: number;
  height?: number;
  // text-only
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  align?: string;
  color?: string;
  outline?: string | null;
  outlineWidth?: number;
  shadow?: boolean;
  rtl?: boolean;
  // shape-only
  shape?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  points?: [number, number][];
}

export function serializeLayers(layers: Layer[]): string {
  const serialized: SerializedLayer[] = layers.map((l) => {
    const base: SerializedLayer = {
      id: l.id,
      kind: l.kind,
      name: l.name,
      visible: l.visible,
      opacity: l.opacity,
      blendMode: l.blendMode,
      locked: l.locked,
      x: l.x,
      y: l.y,
      rotation: l.rotation
    };
    if (isImageLayer(l)) {
      base.dataUrl = l.canvas.toDataURL("image/png");
      base.width = l.width;
      base.height = l.height;
    } else if (l.kind === "text") {
      base.text = l.text;
      base.fontFamily = l.fontFamily;
      base.fontSize = l.fontSize;
      base.bold = l.bold;
      base.italic = l.italic;
      base.align = l.align;
      base.color = l.color;
      base.outline = l.outline;
      base.outlineWidth = l.outlineWidth;
      base.shadow = l.shadow;
      base.rtl = l.rtl;
    } else if (l.kind === "shape") {
      base.shape = l.shape;
      base.width = l.width;
      base.height = l.height;
      base.fill = l.fill;
      base.stroke = l.stroke;
      base.strokeWidth = l.strokeWidth;
      base.points = l.points;
    }
    return base;
  });
  return JSON.stringify(serialized);
}

export async function deserializeLayers(json: string): Promise<Layer[]> {
  const arr: SerializedLayer[] = JSON.parse(json);
  const out: Layer[] = [];
  for (const s of arr) {
    if (s.kind === "image" && s.dataUrl) {
      const img = new Image();
      img.src = s.dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load layer image"));
      });
      const c = document.createElement("canvas");
      c.width = s.width ?? img.naturalWidth;
      c.height = s.height ?? img.naturalHeight;
      c.getContext("2d")?.drawImage(img, 0, 0);
      out.push({
        id: s.id,
        kind: "image",
        name: s.name,
        visible: s.visible,
        opacity: s.opacity,
        blendMode: s.blendMode as Layer["blendMode"],
        locked: s.locked,
        x: s.x,
        y: s.y,
        rotation: s.rotation,
        width: c.width,
        height: c.height,
        canvas: c
      });
    } else if (s.kind === "text") {
      out.push({
        id: s.id,
        kind: "text",
        name: s.name,
        visible: s.visible,
        opacity: s.opacity,
        blendMode: s.blendMode as Layer["blendMode"],
        locked: s.locked,
        x: s.x,
        y: s.y,
        rotation: s.rotation,
        text: s.text ?? "",
        fontFamily: s.fontFamily ?? "Inter, sans-serif",
        fontSize: s.fontSize ?? 48,
        bold: s.bold ?? false,
        italic: s.italic ?? false,
        align: (s.align as "left" | "center" | "right") ?? "left",
        color: s.color ?? "#ffffff",
        outline: s.outline ?? null,
        outlineWidth: s.outlineWidth ?? 0,
        shadow: s.shadow ?? false,
        rtl: s.rtl ?? false
      });
    } else if (s.kind === "shape") {
      out.push({
        id: s.id,
        kind: "shape",
        name: s.name,
        visible: s.visible,
        opacity: s.opacity,
        blendMode: s.blendMode as Layer["blendMode"],
        locked: s.locked,
        x: s.x,
        y: s.y,
        rotation: s.rotation,
        shape: (s.shape as "rectangle") ?? "rectangle",
        width: s.width ?? 200,
        height: s.height ?? 150,
        fill: s.fill ?? "#3b82f6",
        stroke: s.stroke ?? "#1e40af",
        strokeWidth: s.strokeWidth ?? 2,
        points: s.points
      });
    }
  }
  return out;
}