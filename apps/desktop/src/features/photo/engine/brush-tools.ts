import type { BrushOptions } from "@/types/photo";

export interface BrushStroke {
  x: number;
  y: number;
  pressure?: number;
}

export function brushRadius(opts: BrushOptions): number {
  return Math.max(1, opts.size / 2);
}

function samplePixels(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
): { r: number; g: number; b: number } {
  const x0 = Math.max(0, Math.floor(cx - radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const w = Math.min(2 * radius, ctx.canvas.width - x0);
  const h = Math.min(2 * radius, ctx.canvas.height - y0);
  if (w <= 0 || h <= 0) return { r: 128, g: 128, b: 128 };
  const data = ctx.getImageData(x0, y0, w, h).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n++;
  }
  if (n === 0) return { r: 128, g: 128, b: 128 };
  return { r: r / n, g: g / n, b: b / n };
}

export function paintDab(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opts: BrushOptions,
  sourceCanvas: HTMLCanvasElement | null,
  cloneSource: { x: number; y: number } | null
): void {
  const radius = brushRadius(opts);
  const hardness = Math.max(0, Math.min(1, opts.hardness));
  const alpha = opts.opacity * opts.flow;

  if (opts.kind === "eraser") {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
    grad.addColorStop(hardness, `rgba(0,0,0,${alpha})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (opts.kind === "clone" || opts.kind === "heal") {
    if (!sourceCanvas || !cloneSource) return;
    const offsetX = cloneSource.x - x;
    const offsetY = cloneSource.y - y;
    const sCtx = sourceCanvas.getContext("2d");
    if (!sCtx) return;
    const patch = sCtx.getImageData(
      Math.max(0, cloneSource.x - radius),
      Math.max(0, cloneSource.y - radius),
      radius * 2,
      radius * 2
    );
    const tmp = document.createElement("canvas");
    tmp.width = patch.width;
    tmp.height = patch.height;
    tmp.getContext("2d")?.putImageData(patch, 0, 0);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      tmp,
      x - radius + offsetX,
      y - radius + offsetY
    );
    ctx.restore();
    return;
  }

  if (opts.kind === "smudge") {
    const { r, g, b } = samplePixels(ctx, x, y, radius);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (opts.kind === "dodge" || opts.kind === "burn") {
    const lighten = opts.kind === "dodge";
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const tone = lighten ? "255,255,255" : "0,0,0";
    const amount = alpha * opts.strength;
    grad.addColorStop(0, `rgba(${tone},${amount})`);
    grad.addColorStop(hardness, `rgba(${tone},${amount * 0.7})`);
    grad.addColorStop(1, `rgba(${tone},0)`);
    ctx.save();
    ctx.globalCompositeOperation = lighten ? "screen" : "multiply";
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (opts.kind === "blur") {
    const blurCanvas = document.createElement("canvas");
    blurCanvas.width = ctx.canvas.width;
    blurCanvas.height = ctx.canvas.height;
    const bCtx = blurCanvas.getContext("2d");
    if (!bCtx) return;
    bCtx.filter = "blur(4px)";
    bCtx.drawImage(ctx.canvas, 0, 0);

    ctx.save();
    ctx.globalAlpha = alpha * opts.strength;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(blurCanvas, 0, 0);
    ctx.restore();
    return;
  }

  if (opts.kind === "red-eye") {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#1a0a0a";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // paint (default)
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  const soft = Math.max(0.01, hardness);
  grad.addColorStop(0, opts.color);
  grad.addColorStop(soft, opts.color);
  grad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}