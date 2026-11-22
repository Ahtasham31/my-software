# SYSTEM DESIGN — DocuVerse Studio

## 1. System Context
Actors: Customer, Operating System, Local Peripherals (scanner/printer),
Optional Activation Service, Update Feed.

The application operates fully offline for core functionality. Network is used
only for purchase/activation/renewal, optional license sync, and update checks
with explicit user consent.

## 2. Runtime Components
- `app-shell` — Tauri window(s), routing, providers.
- `ipc-bridge` — typed command/event bus.
- `core-services` — settings, db, fs, jobs, license, modules, backup, adapters.
- `workers` — python sidecars (OCR, image, pdf, convert).
- `storage` — SQLite + filesystem zones.

## 3. Key Flows

### 3.1 Startup
1. Load app shell (no python).
2. Load settings, theme, license state, module registry.
3. Show dashboard with recent items, task center, trial/license status.
4. No hidden services started.

### 3.2 Long Job (e.g., OCR)
1. UI submits job via typed command.
2. Job manager validates capability and license entitlement.
3. Worker spawned (pooled), job dispatched.
4. Progress events streamed to task center.
5. On completion, outputs written to job temp then atomically moved.
6. Worker idle-shutdown after timeout.

### 3.3 Module Install
1. User selects module package.
2. Core verifies signature, manifest, app-version compatibility, dependencies.
3. Install to modules directory; register in DB.
4. UI enables module routes on restart/reload.

### 3.4 License Activation
1. Trial stored locally and signed.
2. On purchase, activation service issues signed license bound to device.
3. Client verifies signature offline; stores securely.
4. Offline grace policy defined; sync optional.

### 3.5 Backup
1. Scheduler or manual trigger.
2. Copy user data to backup location (never move/delete source).
3. Write backup manifest + integrity hashes.
4. Restore requires user confirmation; original untouched until restore succeeds.

## 4. State Ownership
- UI state: ephemeral workspace/editor state.
- Settings: Rust settings registry + SQLite.
- Project metadata: SQLite.
- Documents/projects: filesystem.
- Job state: SQLite + in-memory queue.
- License: secure local store + signed blob.

## 5. Error Model
- Typed error codes across IPC.
- UI maps errors to actionable messages.
- Warnings vs errors distinguished; partial-success reported with details.
- No silent failures; all failures logged and surfaced.

## 6. Extensibility
- New modules added via signed manifest without modifying core.
- New themes added as token packs.
- New settings via schema registry.
- New platform adapters behind stable interfaces.