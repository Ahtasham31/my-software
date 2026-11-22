export type LayerKind = "image" | "text" | "shape";

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten";

export interface LayerBase {
  id: string;
  kind: LayerKind;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  locked: boolean;
  x: number;
  y: number;
  rotation: number;
}

export interface ImageLayer extends LayerBase {
  kind: "image";
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
}

export interface TextLayer extends LayerBase {
  kind: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  color: string;
  outline: string | null;
  outlineWidth: number;
  shadow: boolean;
  rtl: boolean;
}

export interface ShapeLayer extends LayerBase {
  kind: "shape";
  shape: "rectangle" | "circle" | "ellipse" | "line" | "arrow" | "polygon";
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  points?: [number, number][];
}

export type Layer = ImageLayer | TextLayer | ShapeLayer;

export function isImageLayer(l: Layer): l is ImageLayer {
  return l.kind === "image";
}

export function isTextLayer(l: Layer): l is TextLayer {
  return l.kind === "text";
}

export function isShapeLayer(l: Layer): l is ShapeLayer {
  return l.kind === "shape";
}