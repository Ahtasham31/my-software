# File Manager Test Report

## Environment
Not executed in authoring. Commands documented for local verification.

## Recommended manual checks
1. `npm run tauri dev` opens desktop window.
2. Dashboard loads counts, storage sizes, project list (empty on first run).
3. Create project from Quick Action → New Project dialog → confirm.
4. Project appears in Recent Projects and File Manager folder tree.
5. Navigate File Manager → Projects → project folder exists.
6. Import a file → unique filename applied; no overwrite on duplicate import.
7. Rename a file → target name conflict rejected.
8. Delete a file → confirm dialog required; original removed only after confirm.
9. Search `Ctrl+K` → query project name → result appears.
10. Activity widget shows `project.created`.

## Commands