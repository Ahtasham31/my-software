# COMPATIBILITY MATRIX — DocuVerse Studio

All entries are planning targets, not guarantees. Verify per release.

## Operating Systems
| Platform | Versions (target) | Package | Notes |
|---|---|---|---|
| Windows | 10 (21H2+), 11 | EXE, MSI | WebView2 runtime required |
| Linux | Current LTS (Debian/Ubuntu/Fedora) | AppImage, DEB, RPM | WebKitGTK; SANE installed |
| macOS | 12+ (Monterey+) | DMG, PKG | Developer ID + notarization |

## CPU Architectures
- Windows: x86_64 (arm64 evaluated).
- Linux: x86_64 (arm64 evaluated).
- macOS: arm64 + x86_64 (universal where practical).

## File Formats (import/export)
- Images: PNG, JPG, TIFF, SVG (raster import); export PNG/JPG/TIFF/SVG.
- PDF: import/edit (page-level operations); render via PDF.js.
- Documents (conversion only): DOCX, XLSX, PPTX, ODT, HTML.
- OCR languages: EN, UR, AR (local packs); others per evaluated packs.
- Card data: CSV, XLSX.
- Templates/assets: local packages (SVG, PNG, JPG, JSON manifests).

## Hardware
### Scanners
- Windows: WIA + TWAIN. Linux: SANE. macOS: ICA + TWAIN.
- Real device matrix required; driver caveats documented per release.

### Printers
- Use OS print stack; test matrix for common inkjet, laser, PVC card printers.
- No universal hardware promise.

## Runtime Dependencies
- WebView2 (Windows), WebKitGTK (Linux), system frameworks (macOS).
- Python runtime bundled with workers (or installed per packaging decision).
- Scanner/printer drivers per device; bundled drivers optional via addendum.

## Limitations to Document
- Scanner/printer compatibility depends on drivers and OS support.
- Urdu/Nastaliq OCR quality varies with document quality.
- Office conversion fidelity may differ from native editors.
- Text editing in PDFs only offered where layout-safe.