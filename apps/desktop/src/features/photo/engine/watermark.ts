export interface WatermarkOptions {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
  position: "tl" | "tr" | "bl" | "br" | "center" | "tile";
  margin: number;
}

export function applyWatermark(
  canvas: HTMLCanvasElement,
  opts: WatermarkOptions
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext("2d");
  if (!ctx) return out;

  ctx.drawImage(canvas, 0, 0);
  ctx.save();
  ctx.globalAlpha = opts.opacity;
  ctx.font = `bold ${opts.fontSize}px ${opts.fontFamily}`;
  ctx.fillStyle = opts.color;

  const w = ctx.measureText(opts.text).width;
  const h = opts.fontSize;

  const positions: Record<string, [number, number]> = {
    tl: [opts.margin, opts.margin + h],
    tr: [out.width - w - opts.margin, opts.margin + h],
    bl: [opts.margin, out.height - opts.margin],
    br: [out.width - w - opts.margin, out.height - opts.margin],
    center: [out.width / 2 - w / 2, out.height / 2 + h / 2]
  };

  if (opts.position === "tile") {
    const stepX = w + 100;
    const stepY = h + 80;
    for (let y = opts.margin; y < out.height; y += stepY) {
      for (let x = opts.margin; x < out.width; x += stepX) {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate((opts.rotation * Math.PI) / 180);
        ctx.fillText(opts.text, -w / 2, h / 4);
        ctx.restore();
      }
    }
  } else {
    const [px, py] = positions[opts.position];
    ctx.save();
    ctx.translate(px + w / 2, py - h / 2);
    ctx.rotate((opts.rotation * Math.PI) / 180);
    ctx.fillText(opts.text, -w / 2, h / 4);
    ctx.restore();
  }
  ctx.restore();
  return out;
}