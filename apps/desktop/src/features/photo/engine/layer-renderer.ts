import type {
  BlendMode,
  ImageLayer,
  Layer,
  ShapeLayer,
  TextLayer
} from "@/types/photo-layers";
import { isImageLayer, isShapeLayer, isTextLayer } from "@/types/photo-layers";

function blendToComposite(mode: BlendMode): GlobalCompositeOperation {
  switch (mode) {
    case "multiply":
      return "multiply";
    case "screen":
      return "screen";
    case "overlay":
      return "overlay";
    case "darken":
      return "darken";
    case "lighten":
      return "lighten";
    default:
      return "source-over";
  }
}

export function renderLayers(
  layers: Layer[],
  width: number,
  height: number
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d");
  if (!ctx) return out;

  for (const layer of layers) {
    if (!layer.visible || layer.opacity <= 0) continue;
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.globalCompositeOperation = blendToComposite(layer.blendMode);
    ctx.translate(layer.x, layer.y);
    if (layer.rotation !== 0) {
      ctx.rotate((layer.rotation * Math.PI) / 180);
    }

    if (isImageLayer(layer)) drawImageLayer(ctx, layer);
    else if (isTextLayer(layer)) drawTextLayer(ctx, layer);
    else if (isShapeLayer(layer)) drawShapeLayer(ctx, layer);

    ctx.restore();
  }
  return out;
}

function drawImageLayer(ctx: CanvasRenderingContext2D, layer: ImageLayer): void {
  ctx.drawImage(layer.canvas, 0, 0, layer.width, layer.height);
}

function drawTextLayer(ctx: CanvasRenderingContext2D, layer: TextLayer): void {
  ctx.font = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${layer.fontSize}px ${layer.fontFamily}`;
  ctx.textAlign = layer.align;
  ctx.textBaseline = "top";
  ctx.direction = layer.rtl ? "rtl" : "ltr";

  if (layer.shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
  }

  const lines = layer.text.split("\n");
  const lineHeight = layer.fontSize * 1.2;

  lines.forEach((line, i) => {
    const y = i * lineHeight;
    if (layer.outline && layer.outlineWidth > 0) {
      ctx.strokeStyle = layer.outline;
      ctx.lineWidth = layer.outlineWidth;
      ctx.strokeText(line, 0, y);
    }
    ctx.fillStyle = layer.color;
    ctx.fillText(line, 0, y);
  });
}

function drawShapeLayer(ctx: CanvasRenderingContext2D, layer: ShapeLayer): void {
  ctx.fillStyle = layer.fill;
  ctx.strokeStyle = layer.stroke;
  ctx.lineWidth = layer.strokeWidth;

  ctx.beginPath();
  switch (layer.shape) {
    case "rectangle":
      ctx.rect(0, 0, layer.width, layer.height);
      break;
    case "circle": {
      const r = Math.min(layer.width, layer.height) / 2;
      ctx.arc(r, r, r, 0, Math.PI * 2);
      break;
    }
    case "ellipse":
      ctx.ellipse(
        layer.width / 2,
        layer.height / 2,
        layer.width / 2,
        layer.height / 2,
        0,
        0,
        Math.PI * 2
      );
      break;
    case "line":
      ctx.moveTo(0, 0);
      ctx.lineTo(layer.width, layer.height);
      break;
    case "arrow":
      ctx.moveTo(0, layer.height / 2);
      ctx.lineTo(layer.width - 10, layer.height / 2);
      ctx.moveTo(layer.width - 10, layer.height / 2 - 6);
      ctx.lineTo(layer.width, layer.height / 2);
      ctx.lineTo(layer.width - 10, layer.height / 2 + 6);
      break;
    case "polygon":
      if (layer.points && layer.points.length > 0) {
        ctx.moveTo(layer.points[0][0], layer.points[0][1]);
        for (let i = 1; i < layer.points.length; i++) {
          ctx.lineTo(layer.points[i][0], layer.points[i][1]);
        }
        ctx.closePath();
      }
      break;
  }
  if (layer.shape !== "line" && layer.shape !== "arrow") {
    ctx.fill();
  }
  if (layer.strokeWidth > 0) {
    ctx.stroke();
  }
}