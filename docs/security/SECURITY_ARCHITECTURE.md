# SECURITY ARCHITECTURE — DocuVerse Studio

## 1. Principles
- Local-first, minimal external trust.
- Least privilege on IPC and filesystem.
- Signed artifacts (updates, modules, licenses).
- No secrets in the client.
- Honest, documented network behavior.

## 2. Threat Model (summary)
- Malicious input files (PDFs, images, office docs).
- Tampered module packages or updates.
- License tampering / trial reset attempts.
- Path traversal / symlink escape via imports or jobs.
- Secret leakage (logs, temp).
- Unauthorized network exfiltration.

## 3. Controls

### Filesystem
- Path resolution against allowed roots.
- Reject `..` and symlink escapes.
- Atomic writes.
- Temp files in dedicated zone only.
- Explicit user confirmation for overwrite.

### IPC
- Typed contracts; capability gate per command.
- No raw shell execution from UI.
- Worker I/O framed and validated.

### Modules & Updates
- Signed manifests; signature verified before install/run.
- Compatibility and dependency checks.
- Rollback on failed install.
- Update feed over HTTPS; signature verified.

### Licensing
- Public key verification only; private key server-side.
- Secure store for license blob.
- Best-effort local trial tamper resistance; server validation on activation.

### Logging & Diagnostics
- Redact absolute user paths and secrets.
- User-exported diagnostics only on explicit action.

### Network
- Only for purchase/activation/renewal, optional license sync, update checks.
- All network calls documented and user-visible.
- No background telemetry.

## 4. Permissions
- Module capabilities listed in manifest.
- App grants only declared capabilities.
- Undeclared capabilities fail closed.

## 5. Data Integrity
- DB backups verified.
- Project files checksummed on backup.
- Recovery snapshots validated before use.

## 6. Privacy
- No hidden uploads.
- No AI endpoints.
- Privacy documentation shipped.
- Privacy controls in Settings.

## 7. Open Items
- Final selection of secure secret storage per OS.
- Final choice of update signing infrastructure.
- Pen-testing scope and cadence.