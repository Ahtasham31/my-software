import type { Adjustments, Rect } from "@/types/photo";

export function cloneCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d");
  if (ctx) ctx.drawImage(src, 0, 0);
  return out;
}

export function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = img.naturalWidth;
  out.height = img.naturalHeight;
  const ctx = out.getContext("2d");
  if (ctx) ctx.drawImage(img, 0, 0);
  return out;
}

export function cropCanvas(src: HTMLCanvasElement, rect: Rect): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.floor(rect.w));
  out.height = Math.max(1, Math.floor(rect.h));
  const ctx = out.getContext("2d");
  if (ctx) {
    ctx.drawImage(
      src,
      Math.floor(rect.x),
      Math.floor(rect.y),
      out.width,
      out.height,
      0,
      0,
      out.width,
      out.height
    );
  }
  return out;
}

export function resizeCanvas(
  src: HTMLCanvasElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.floor(width));
  out.height = Math.max(1, Math.floor(height));
  const ctx = out.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(src, 0, 0, out.width, out.height);
  }
  return out;
}

export function rotateCanvas(src: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
  const rad = (degrees * Math.PI) / 180;
  const swap = degrees === 90 || degrees === 270 || degrees === -90 || degrees === -270;
  const out = document.createElement("canvas");
  out.width = swap ? src.height : src.width;
  out.height = swap ? src.width : src.height;
  const ctx = out.getContext("2d");
  if (ctx) {
    ctx.translate(out.width / 2, out.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(src, -src.width / 2, -src.height / 2);
  }
  return out;
}

export function buildFilterCSS(a: Adjustments): string {
  const parts: string[] = [];
  if (a.brightness !== 1) parts.push(`brightness(${a.brightness})`);
  if (a.contrast !== 1) parts.push(`contrast(${a.contrast})`);
  if (a.saturate !== 1) parts.push(`saturate(${a.saturate})`);
  if (a.hue !== 0) parts.push(`hue-rotate(${a.hue}deg)`);
  if (a.blur > 0) parts.push(`blur(${a.blur}px)`);
  if (a.grayscale > 0) parts.push(`grayscale(${a.grayscale})`);
  if (a.sepia > 0) parts.push(`sepia(${a.sepia})`);
  if (a.invert > 0) parts.push(`invert(${a.invert})`);
  return parts.length > 0 ? parts.join(" ") : "none";
}

export function bakeAdjustments(
  src: HTMLCanvasElement,
  adjustments: Adjustments
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d");
  if (!ctx) return out;

  ctx.filter = buildFilterCSS(adjustments);
  ctx.drawImage(src, 0, 0);
  ctx.filter = "none";

  const needsPixelLoop =
    adjustments.exposure !== 0 || adjustments.temperature !== 0;
  if (!needsPixelLoop) return out;

  const imgData = ctx.getImageData(0, 0, out.width, out.height);
  const d = imgData.data;
  const expFactor = Math.pow(2, adjustments.exposure);
  const temp = adjustments.temperature;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i] * expFactor;
    let g = d[i + 1] * expFactor;
    let b = d[i + 2] * expFactor;
    r += temp;
    b -= temp;
    d[i] = Math.max(0, Math.min(255, r));
    d[i + 1] = Math.max(0, Math.min(255, g));
    d[i + 2] = Math.max(0, Math.min(255, b));
  }
  ctx.putImageData(imgData, 0, 0);
  return out;
}

export function applyFilterToCanvas(
  src: HTMLCanvasElement,
  filterId: string
): HTMLCanvasElement {
  const out = cloneCanvas(src);
  const ctx = out.getContext("2d");
  if (!ctx) return out;

  switch (filterId) {
    case "grayscale":
      ctx.filter = "grayscale(1)";
      ctx.drawImage(src, 0, 0);
      break;
    case "sepia":
      ctx.filter = "sepia(1)";
      ctx.drawImage(src, 0, 0);
      break;
    case "invert":
      ctx.filter = "invert(1)";
      ctx.drawImage(src, 0, 0);
      break;
    case "blur":
      ctx.filter = "blur(3px)";
      ctx.drawImage(src, 0, 0);
      break;
    case "sharpen": {
      const id = ctx.getImageData(0, 0, out.width, out.height);
      const sharpened = convolve3x3(id, [0, -1, 0, -1, 5, -1, 0, -1, 0]);
      ctx.putImageData(sharpened, 0, 0);
      break;
    }
    case "vintage":
      ctx.filter = "sepia(0.5) contrast(1.1) brightness(0.95)";
      ctx.drawImage(src, 0, 0);
      ctx.filter = "none";
      {
        const id = ctx.getImageData(0, 0, out.width, out.height);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = Math.min(255, d[i] * 1.05);
          d[i + 1] = Math.min(255, d[i + 1] * 0.98);
          d[i + 2] = Math.min(255, d[i + 2] * 0.9);
        }
        ctx.putImageData(id, 0, 0);
      }
      break;
    case "warm": {
      const id = ctx.getImageData(0, 0, out.width, out.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = Math.min(255, d[i] + 20);
        d[i + 1] = Math.min(255, d[i + 1] + 5);
        d[i + 2] = Math.max(0, d[i + 2] - 20);
      }
      ctx.putImageData(id, 0, 0);
      break;
    }
    case "cool": {
      const id = ctx.getImageData(0, 0, out.width, out.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = Math.max(0, d[i] - 20);
        d[i + 1] = Math.max(0, d[i + 1] - 5);
        d[i + 2] = Math.min(255, d[i + 2] + 20);
      }
      ctx.putImageData(id, 0, 0);
      break;
    }
    default:
      break;
  }
  return out;
}

function convolve3x3(src: ImageData, kernel: number[]): ImageData {
  const w = src.width;
  const h = src.height;
  const dst = new ImageData(w, h);
  const s = src.data;
  const d = dst.data;
  const half = 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const px = Math.min(w - 1, Math.max(0, x + kx - half));
          const py = Math.min(h - 1, Math.max(0, y + ky - half));
          const idx = (py * w + px) * 4;
          const k = kernel[ky * 3 + kx];
          r += s[idx] * k;
          g += s[idx + 1] * k;
          b += s[idx + 2] * k;
        }
      }
      const outIdx = (y * w + x) * 4;
      d[outIdx] = Math.max(0, Math.min(255, r));
      d[outIdx + 1] = Math.max(0, Math.min(255, g));
      d[outIdx + 2] = Math.max(0, Math.min(255, b));
      d[outIdx + 3] = s[outIdx + 3];
    }
  }
  return dst;
}

export function makeTransparent(
  src: HTMLCanvasElement,
  mask: Uint8Array
): HTMLCanvasElement {
  const out = cloneCanvas(src);
  const ctx = out.getContext("2d");
  if (!ctx) return out;
  const imgData = ctx.getImageData(0, 0, out.width, out.height);
  const d = imgData.data;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) d[i * 4 + 3] = 0;
  }
  ctx.putImageData(imgData, 0, 0);
  return out;
}

export function fillMask(
  src: HTMLCanvasElement,
  mask: Uint8Array,
  color: string
): HTMLCanvasElement {
  const out = cloneCanvas(src);
  const ctx = out.getContext("2d");
  if (!ctx) return out;
  const tmp = document.createElement("canvas");
  tmp.width = out.width;
  tmp.height = out.height;
  const tctx = tmp.getContext("2d");
  if (!tctx) return out;
  tctx.fillStyle = color;
  tctx.fillRect(0, 0, tmp.width, tmp.height);
  const tmpData = tctx.getImageData(0, 0, tmp.width, tmp.height).data;
  const imgData = ctx.getImageData(0, 0, out.width, out.height);
  const d = imgData.data;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) {
      d[i * 4] = tmpData[i * 4];
      d[i * 4 + 1] = tmpData[i * 4 + 1];
      d[i * 4 + 2] = tmpData[i * 4 + 2];
      d[i * 4 + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return out;
}



// ---- Additional adjustments ----
export function applyHighlightsShadows(
  src: HTMLCanvasElement,
  highlights: number,
  shadows: number,
  whites: number,
  blacks: number
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d");
  if (!ctx) return out;
  ctx.drawImage(src, 0, 0);

  const imgData = ctx.getImageData(0, 0, out.width, out.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let v = d[i + c];
      const norm = v / 255;
      if (norm > 0.5) {
        v += highlights * (norm - 0.5) * 2 * 50;
      } else {
        v += shadows * (0.5 - norm) * 2 * 50;
      }
      if (norm > 0.8) v += whites * 40;
      if (norm < 0.2) v += blacks * 40;
      d[i + c] = Math.max(0, Math.min(255, v));
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return out;
}

export function applyVibrance(src: HTMLCanvasElement, vibrance: number): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d");
  if (!ctx) return out;
  ctx.drawImage(src, 0, 0);

  const imgData = ctx.getImageData(0, 0, out.width, out.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const factor = 1 + (vibrance * (1 - sat));
    d[i] = Math.max(0, Math.min(255, (r - max) * factor + max));
    d[i + 1] = Math.max(0, Math.min(255, (g - max) * factor + max));
    d[i + 2] = Math.max(0, Math.min(255, (b - max) * factor + max));
  }
  ctx.putImageData(imgData, 0, 0);
  return out;
}

export function applyGamma(src: HTMLCanvasElement, gamma: number): HTMLCanvasElement {
  if (gamma === 1) return src;
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d");
  if (!ctx) return out;
  ctx.drawImage(src, 0, 0);

  const imgData = ctx.getImageData(0, 0, out.width, out.height);
  const d = imgData.data;
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.min(255, Math.max(0, Math.round(Math.pow(i / 255, 1 / gamma) * 255)));
  }
  for (let i = 0; i < d.length; i += 4) {
    d[i] = lut[d[i]];
    d[i + 1] = lut[d[i + 1]];
    d[i + 2] = lut[d[i + 2]];
  }
  ctx.putImageData(imgData, 0, 0);
  return out;
}

// ---- Additional filters ----
export function applyMedianFilter(src: HTMLCanvasElement, radius: number = 1): HTMLCanvasElement {
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

export function applyNoiseReduction(src: HTMLCanvasElement): HTMLCanvasElement {
  return applyMedianFilter(src, 1);
}

export function applyUnsharpMask(src: HTMLCanvasElement, amount: number = 1): HTMLCanvasElement {
  const blurred = document.createElement("canvas");
  blurred.width = src.width;
  blurred.height = src.height;
  const bctx = blurred.getContext("2d");
  if (!bctx) return src;
  bctx.filter = "blur(2px)";
  bctx.drawImage(src, 0, 0);
  bctx.filter = "none";

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

export function autoLevels(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d");
  if (!ctx) return out;
  ctx.drawImage(src, 0, 0);

  const id = ctx.getImageData(0, 0, out.width, out.height);
  const d = id.data;

  for (let c = 0; c < 3; c++) {
    let min = 255;
    let max = 0;
    for (let i = c; i < d.length; i += 4) {
      if (d[i] < min) min = d[i];
      if (d[i] > max) max = d[i];
    }
    const range = max - min || 1;
    for (let i = c; i < d.length; i += 4) {
      d[i] = Math.max(0, Math.min(255, ((d[i] - min) / range) * 255));
    }
  }
  ctx.putImageData(id, 0, 0);
  return out;
}