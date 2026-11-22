# Layers Architecture

## Model
```ts
type Layer = ImageLayer | TextLayer | ShapeLayer;

interface LayerBase {
  id, kind, name, visible, opacity, blendMode, locked, x, y, rotation
}