import { useCallback, useRef, useState } from "react";
import type {
  BlendMode,
  ImageLayer,
  Layer,
  ShapeLayer,
  TextLayer
} from "@/types/photo-layers";
import { isImageLayer, isTextLayer, isShapeLayer } from "@/types/photo-layers";

let nextId = 1;
const id = () => `layer_${nextId++}_${Date.now()}`;

export function useLayers() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const layersRef = useRef<Layer[]>([]);
  layersRef.current = layers;

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const addImageLayer = useCallback(
    (canvas: HTMLCanvasElement, name = "Image"): ImageLayer => {
      const layer: ImageLayer = {
        id: id(),
        kind: "image",
        name,
        visible: true,
        opacity: 1,
        blendMode: "normal",
        locked: false,
        x: 0,
        y: 0,
        rotation: 0,
        width: canvas.width,
        height: canvas.height,
        canvas
      };
      setLayers((prev) => [...prev, layer]);
      setSelectedId(layer.id);
      bump();
      return layer;
    },
    [bump]
  );

  const addTextLayer = useCallback(
    (text = "Text"): TextLayer => {
      const layer: TextLayer = {
        id: id(),
        kind: "text",
        name: text.slice(0, 20),
        visible: true,
        opacity: 1,
        blendMode: "normal",
        locked: false,
        x: 50,
        y: 50,
        rotation: 0,
        text,
        fontFamily: "Inter, sans-serif",
        fontSize: 48,
        bold: false,
        italic: false,
        align: "left",
        color: "#ffffff",
        outline: null,
        outlineWidth: 0,
        shadow: false,
        rtl: false
      };
      setLayers((prev) => [...prev, layer]);
      setSelectedId(layer.id);
      bump();
      return layer;
    },
    [bump]
  );

  const addShapeLayer = useCallback(
    (shape: ShapeLayer["shape"] = "rectangle"): ShapeLayer => {
      const layer: ShapeLayer = {
        id: id(),
        kind: "shape",
        name: shape.charAt(0).toUpperCase() + shape.slice(1),
        visible: true,
        opacity: 1,
        blendMode: "normal",
        locked: false,
        x: 100,
        y: 100,
        rotation: 0,
        shape,
        width: 200,
        height: 150,
        fill: "#3b82f6",
        stroke: "#1e40af",
        strokeWidth: 2
      };
      setLayers((prev) => [...prev, layer]);
      setSelectedId(layer.id);
      bump();
      return layer;
    },
    [bump]
  );

  const updateLayer = useCallback((layerId: string, patch: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? ({ ...l, ...patch } as Layer) : l))
    );
    bump();
  }, [bump]);

  const updateTextLayer = useCallback(
    (layerId: string, patch: Partial<TextLayer>) => {
      setLayers((prev) =>
        prev.map((l) =>
          l.id === layerId && isTextLayer(l) ? { ...l, ...patch } : l
        )
      );
      bump();
    },
    [bump]
  );

  const updateShapeLayer = useCallback(
    (layerId: string, patch: Partial<ShapeLayer>) => {
      setLayers((prev) =>
        prev.map((l) =>
          l.id === layerId && isShapeLayer(l) ? { ...l, ...patch } : l
        )
      );
      bump();
    },
    [bump]
  );

  const removeLayer = useCallback((layerId: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== layerId));
    setSelectedId((cur) => (cur === layerId ? null : cur));
    bump();
  }, [bump]);

  const duplicateLayer = useCallback((layerId: string) => {
    setLayers((prev) => {
      const src = prev.find((l) => l.id === layerId);
      if (!src) return prev;
      const dup: Layer = { ...src, id: id(), name: `${src.name} copy` } as Layer;
      if (isImageLayer(dup)) {
        const c = document.createElement("canvas");
        c.width = dup.canvas.width;
        c.height = dup.canvas.height;
        c.getContext("2d")?.drawImage(dup.canvas, 0, 0);
        dup.canvas = c;
      }
      return [...prev, dup];
    });
    bump();
  }, [bump]);

  const reorderLayer = useCallback((from: number, to: number) => {
    setLayers((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    bump();
  }, [bump]);

  const toggleVisible = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
    );
    bump();
  }, [bump]);

  const toggleLock = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l))
    );
    bump();
  }, [bump]);

  const setOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, opacity } : l))
    );
    bump();
  }, [bump]);

  const setBlendMode = useCallback((layerId: string, blendMode: BlendMode) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, blendMode } : l))
    );
    bump();
  }, [bump]);

  const renameLayer = useCallback((layerId: string, name: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, name } : l))
    );
    bump();
  }, [bump]);

  const replaceAll = useCallback((next: Layer[]) => {
    setLayers(next);
    setSelectedId(next.length > 0 ? next[0].id : null);
    bump();
  }, [bump]);

  const clear = useCallback(() => {
    setLayers([]);
    setSelectedId(null);
    bump();
  }, [bump]);

  return {
    layers,
    selectedId,
    version,
    select: setSelectedId,
    addImageLayer,
    addTextLayer,
    addShapeLayer,
    updateLayer,
    updateTextLayer,
    updateShapeLayer,
    removeLayer,
    duplicateLayer,
    reorderLayer,
    toggleVisible,
    toggleLock,
    setOpacity,
    setBlendMode,
    renameLayer,
    replaceAll,
    clear,
    selected: layers.find((l) => l.id === selectedId) ?? null
  };
}