# TECHNICAL ARCHITECTURE — DocuVerse Studio

## 1. Architectural Style
Layered, local-first desktop architecture:

UI (React/TS) → typed IPC → Rust Core → (Jobs → Workers | Platform Adapters | Storage)

- Rust owns lifecycle, storage, security, jobs, licensing, module management.
- React owns presentation and workspace UX; no business-critical logic.
- Python workers are optional, isolated, spawned on demand.

## 2. Layers

### 2.1 Presentation Layer
- React + TypeScript + Vite + Tailwind + shadcn/ui + Lucide.
- Design tokens via CSS variables; themes as token packs.
- Lazy-loaded module UIs.
- Command palette, task center, notification center as cross-cutting features.

### 2.2 IPC Boundary
- Typed command contracts (request/response schemas, error codes).
- Event channels for progress/log/state.
- Capability checks per command.
- No raw filesystem paths exposed across IPC without validation.

### 2.3 Core (Rust)
- App lifecycle, windows, update check, crash recovery.
- Settings registry (schema-driven).
- DB layer (SQLite via sqlx/rusqlite; migrations).
- Safe filesystem service.
- Job manager (queue, concurrency, cancel, progress, retry).
- License verifier (public key only).
- Module manager (manifest, signature, install/uninstall/repair).
- Backup/recovery service.
- Platform adapters: scanner, printer, filesystem, printing, update feed.

### 2.4 Workers (Python, optional)
- Started only when needed.
- JSON-RPC-style protocol over stdio/local IPC.
- Job ID, progress, logs, warnings, cancellation, output manifest.
- Idle shutdown to free memory.

### 2.5 Storage
- SQLite for metadata.
- Filesystem for documents/projects/cache/temp/backup/logs/modules.
- Separate app binaries from user data.

## 3. Process Model
- Single main Tauri process + webview(s).
- Worker processes spawned per job family, pooled with idle timeout.
- Platform adapter calls run in Rust (native APIs) or via helper subprocesses.
- No hidden background services; everything is user-visible via task center.

## 4. Communication Contracts
Command: