# OCR Settings Reference

Persisted in `localStorage` under `docuverse.ocr.settings.v1` (frontend
scope). Global appearance remains in SQLite via SettingsProvider.

| Setting | Default | Effect |
|---|---|---|
| defaultLanguage | `eng` | Initial language in each tab |
| defaultPsm | 3 | Tesseract page segmentation mode |
| defaultOutputFormat | `txt` | Preferred save format |
| defaultExportFolder | `""` | Folder hint |
| confirmBeforeExport | true | Confirmation dialog before saving |
| performanceProfile | `balanced` | Low-RAM / Balanced / High / Custom |
| maxConcurrentJobs | 2 | Hint for future parallel batch |