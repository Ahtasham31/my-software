# TECHNOLOGY STACK — DocuVerse Studio

For each technology: why chosen, role, modules, advantages, limitations,
licensing, performance impact.

---

## Tauri 2
- Why: light, secure desktop shell with Rust core.
- Role: windowing, IPC, update hooks, capability model.
- Modules: all.
- Pros: small footprint vs Electron; Rust security.
- Cons: webview differences per OS; some native API gaps.
- Licensing: permissive (Apache/MIT), verify per-version.
- Perf: fast startup; webview memory is main cost.

## Rust
- Why: memory safety, performance, strong platform bindings.
- Role: core services, native adapters, jobs, license verify, module manager.
- Modules: all (via core).
- Pros: safety, performance, reliable concurrency.
- Cons: development cost.
- Licensing: crates must be audited individually.
- Perf: low overhead; avoid blocking main thread.

## React + TypeScript + Vite
- Why: mature, typed UI, fast dev with lazy loading.
- Role: all UI.
- Pros: ecosystem, component model, strong typing.
- Cons: webview memory; discipline needed for strict typing.
- Licensing: permissive.
- Perf: lazy routes, virtualization, memoization.

## Tailwind CSS + shadcn/ui + Lucide
- Why: consistent design tokens and accessible primitives; lightweight icons.
- Role: styling, components, iconography.
- Licensing: permissive; verify each package.
- Perf: no runtime cost beyond CSS bundle.

## SQLite (rusqlite or sqlx)
- Why: robust embedded relational DB, local-first.
- Role: metadata, jobs, settings, license, modules.
- Pros: mature, reliable, transactional.
- Cons: single-writer concurrency; not a blob store.
- Licensing: public domain / MIT-like (verify crates).
- Perf: excellent for metadata; batch writes.

## OpenCV (Python worker)
- Why: mature traditional image processing.
- Role: background removal, cleanup, transforms.
- Modules: Photo, Passport, Scanner cleanup, Card image prep.
- Pros: breadth and reliability.
- Cons: worker packaging, CPU cost.
- Licensing: Apache-2.0.
- Perf: heavy; run in worker, bounded concurrency.

## Tesseract (+ evaluated alternatives)
- Why: local OCR with language packs.
- Role: OCR Studio, searchable PDF.
- Pros: local, no cloud.
- Cons: Urdu/Nastaliq quality is variable; needs testing.
- Licensing: Apache-2.0 (verify language packs).
- Perf: CPU-bound; per-page pipeline.

## PDF.js
- Why: reliable in-app PDF rendering.
- Role: viewer, thumbnails.
- Pros: mature, in-browser rendering.
- Cons: heavy rendering for large PDFs; mitigate with lazy ranges.
- Licensing: Apache-2.0.
- Perf: render on demand; page-range loading.

## PyMuPDF and qpdf (worker)
- Why: robust PDF operations.
- Role: merge/split/compress/encrypt/compare.
- Pros: capable, mature.
- Cons: **PyMuPDF licensing risk (AGPL/commercial)** — requires commercial
  license or alternative; must decide before implementation.
- Licensing: qpdf Apache-2.0; PyMuPDF AGPL/commercial.
- Perf: CPU-bound; worker isolation.

## Python workers (packaged)
- Why: access to specialized libraries without bloating Rust.
- Role: OCR, image, PDF, conversion helpers.
- Pros: library ecosystem.
- Cons: packaging size, startup latency, sidecar management.
- Licensing: Python PSF; packaging tool licenses must be verified.
- Perf: lazy spawn, idle shutdown, bounded concurrency.

## LibreOffice headless (conversion, evaluated)
- Why: DOCX/XLSX/PPTX/ODT conversion fidelity.
- Role: Conversion Studio.
- Pros: broad format support.
- Cons: large, fidelity varies, licensing review required.
- Licensing: MPL/LGPL — verify redistribution terms.
- Perf: heavy; run in worker with careful cleanup.

## Platform scanner adapters
- Windows: WIA/TWAIN. Linux: SANE. macOS: ICA/TWAIN.
- Perf: varies; stream pages, avoid full-page buffers where possible.
- Licensing: OS/vendor terms; ship without bundling vendor drivers by default.

## Platform print adapters
- Use OS print APIs and PDF preview.
- Licensing: OS-level; no additional bundling required.

## Not included
- No AI/LLM SDKs.
- No office editor libraries.
- No mandatory cloud SDKs.