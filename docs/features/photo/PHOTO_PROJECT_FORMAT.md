# Photo Project Format

## Database table `photo_projects`
Columns: id, name, project_path, source_path, width, height, format,
metadata_json, layers_json, created_at, updated_at.

## Layer serialization
`layers_json` stores an array of layer descriptors. Image layers hold a PNG
data URL. Text/shape layers hold their primitive properties. See
`use-project-persistence.ts` for the shape.

## Save / open
`photo_project_save` persists a new record. Full reopen UI (restoring
layers onto the canvas) is prepared via `deserializeLayers` but the UI
wiring lands in a later phase — documented as a limitation.

## Compatibility
JSON additions are forward-compatible: unknown keys are ignored during
deserialization. Schema changes require a new migration.