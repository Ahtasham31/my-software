import type { SheetLayout } from "@/types/passport";
import { mmToPx } from "@/types/passport";

export interface SheetCell {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SheetPlan {
  dpi: number;
  sheetWidthPx: number;
  sheetHeightPx: number;
  photoWidthPx: number;
  photoHeightPx: number;
  cells: SheetCell[];
  columns: number;
  rows: number;
}

export function computeSheetPlan(
  layout: SheetLayout,
  photoWidthMm: number,
  photoHeightMm: number,
  dpi: number
): SheetPlan {
  const sheetWidthPx = mmToPx(layout.widthMm, dpi);
  const sheetHeightPx = mmToPx(layout.heightMm, dpi);
  const photoWidthPx = mmToPx(photoWidthMm, dpi);
  const photoHeightPx = mmToPx(photoHeightMm, dpi);
  const marginPx = mmToPx(layout.marginMm, dpi);
  const gapPx = mmToPx(layout.gapMm, dpi);

  const availableW = sheetWidthPx - marginPx * 2;
  const availableH = sheetHeightPx - marginPx * 2;

  const columns = Math.max(1, Math.floor((availableW + gapPx) / (photoWidthPx + gapPx)));
  const rows = Math.max(1, Math.floor((availableH + gapPx) / (photoHeightPx + gapPx)));

  const usedW = columns * photoWidthPx + (columns - 1) * gapPx;
  const usedH = rows * photoHeightPx + (rows - 1) * gapPx;
  const startX = Math.floor((sheetWidthPx - usedW) / 2);
  const startY = Math.floor((sheetHeightPx - usedH) / 2);

  const cells: SheetCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      cells.push({
        x: startX + c * (photoWidthPx + gapPx),
        y: startY + r * (photoHeightPx + gapPx),
        width: photoWidthPx,
        height: photoHeightPx
      });
    }
  }

  return {
    dpi,
    sheetWidthPx,
    sheetHeightPx,
    photoWidthPx,
    photoHeightPx,
    cells,
    columns,
    rows
  };
}

export function renderSheet(
  photoCanvas: HTMLCanvasElement,
  plan: SheetPlan
): HTMLCanvasElement {
  const sheet = document.createElement("canvas");
  sheet.width = plan.sheetWidthPx;
  sheet.height = plan.sheetHeightPx;
  const ctx = sheet.getContext("2d");
  if (!ctx) return sheet;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sheet.width, sheet.height);

  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;

  for (const cell of plan.cells) {
    ctx.drawImage(photoCanvas, cell.x, cell.y, cell.width, cell.height);
    ctx.strokeRect(cell.x + 0.5, cell.y + 0.5, cell.width - 1, cell.height - 1);
  }

  return sheet;
}