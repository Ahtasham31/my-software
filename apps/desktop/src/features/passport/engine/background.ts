import type { BackgroundPreset, CustomBackground } from "@/types/passport";

export function customToPreset(c: CustomBackground): BackgroundPreset {
  return {
    id: `custom:${c.id}`,
    label: c.name,
    kind: c.kind === "gradient" ? "gradient" : "solid",
    color: c.color1,
    color2: c.color2 ?? undefined
  };
}

export function parseCustomBgId(bgId: string): string | null {
  if (!bgId.startsWith("custom:")) return null;
  if (bgId.startsWith("custom:#")) return null;
  return bgId.slice("custom:".length);
}

export function makeBackground(
  width: number,
  height: number,
  preset: BackgroundPreset
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  if (preset.kind === "transparent") {
    return canvas;
  }

  if (preset.kind === "solid" && preset.color) {
    ctx.fillStyle = preset.color;
    ctx.fillRect(0, 0, width, height);
    return canvas;
  }

  if (preset.kind === "gradient" && preset.color && preset.color2) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, preset.color);
    grad.addColorStop(1, preset.color2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas;
}

export function compositePhotoOnBackground(
  photo: HTMLCanvasElement,
  background: HTMLCanvasElement
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = background.width;
  out.height = background.height;
  const ctx = out.getContext("2d");
  if (!ctx) return out;
  ctx.drawImage(background, 0, 0);
  ctx.drawImage(photo, 0, 0);
  return out;
}