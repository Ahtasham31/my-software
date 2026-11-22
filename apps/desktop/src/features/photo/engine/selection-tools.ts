export type SelectionShape = "rectangle" | "ellipse" | "lasso" | "polygon";

export function maskFromRect(
  width: number,
  height: number,
  x: number,
  y: number,
  w: number,
  h: number
): Uint8Array {
  const mask = new Uint8Array(width * height);
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(width, Math.ceil(x + w));
  const y1 = Math.min(height, Math.ceil(y + h));
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) {
      mask[yy * width + xx] = 1;
    }
  }
  return mask;
}

export function maskFromEllipse(
  width: number,
  height: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): Uint8Array {
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) mask[y * width + x] = 1;
    }
  }
  return mask;
}

export function maskFromLasso(
  width: number,
  height: number,
  points: [number, number][]
): Uint8Array {
  const mask = new Uint8Array(width * height);
  if (points.length < 3) return mask;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return mask;

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
  ctx.fill();

  const data = ctx.getImageData(0, 0, width, height).data;
  for (let i = 0; i < width * height; i++) {
    if (data[i * 4 + 3] > 0) mask[i] = 1;
  }
  return mask;
}

export function featherMask(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number
): Uint8Array {
  if (radius <= 0) return mask;
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          sum += mask[ny * width + nx];
          count++;
        }
      }
      out[y * width + x] = sum / count > 0.5 ? 1 : 0;
    }
  }
  return out;
}

export function invertMask(mask: Uint8Array): Uint8Array {
  const out = new Uint8Array(mask.length);
  for (let i = 0; i < mask.length; i++) out[i] = mask[i] ? 0 : 1;
  return out;
}

export function combineMasks(a: Uint8Array, b: Uint8Array, op: "add" | "subtract"): Uint8Array {
  const out = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = op === "add" ? (a[i] || b[i] ? 1 : 0) : a[i] && !b[i] ? 1 : 0;
  }
  return out;
}