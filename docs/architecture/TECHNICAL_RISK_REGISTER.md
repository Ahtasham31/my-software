
---

## 14. `TECHNICAL_RISK_REGISTER.md`

```markdown
# TECHNICAL RISK REGISTER — DocuVerse Studio

Each risk: description, impact, approach, testing.

## R01 Cross-platform Scanner Support
- Description: WIA/TWAIN/SANE/ICA behaviors vary; drivers inconsistent.
- Impact: device-specific failures; user frustration.
- Approach: adapter interface, per-platform capability detection, driver
  guidance in Help; ship no vendor drivers by default.
- Testing: real device matrix per release; simulated drivers in CI.

## R02 Printer Compatibility
- Description: driver behavior and rasterization vary widely.
- Impact: misprints, alignment issues.
- Approach: rely on OS print stack; PDF preview; profiles per printer;
  calibration flow for PVC.
- Testing: device matrix; alignment and duplex tests.

## R03 Urdu/Nastaliq OCR Accuracy
- Description: complex scripts yield lower accuracy.
- Impact: user dissatisfaction if overpromised.
- Approach: confidence UI, correction workflow, honest messaging; benchmark
  fixtures; evaluate alternatives.
- Testing: benchmark set of realistic documents; regression tests.

## R04 Large PDF Processing
- Description: memory and time blowups on big files.
- Impact: crashes, slow UI.
- Approach: streaming pipelines, page ranges, lazy thumbnails, worker
  isolation, cancellation.
- Testing: large-file fixtures; memory profiles.

## R05 Image Memory Usage
- Description: high-res photos consume large RAM.
- Impact: low-RAM machines suffer.
- Approach: tiled processing, downscale previews, bounded concurrency,
  worker lifecycle management.
- Testing: memory profiling on min spec hardware.

## R06 Conversion Fidelity
- Description: DOCX/XLSX/PPTX/ODT conversion may differ.
- Impact: layout drift; user confusion.
- Approach: honest messaging, preserve originals, options for strict layout
  where possible.
- Testing: fidelity fixtures across categories.

## R07 Module Compatibility
- Description: module/app version drift.
- Impact: broken modules.
- Approach: signed manifests with compatible-range; dependency checks;
  repair flow.
- Testing: matrix of module vs app versions.

## R08 License Validation Without Internet
- Description: offline devices can't reach activation service.
- Impact: locked-out users.
- Approach: signed offline license blobs, defined grace window, recovery via
  re-issue; expired licenses still allow local file access.
- Testing: offline scenarios; clock tampering checks; recovery flows.

## R09 Third-Party Licensing
- Description: some dependencies carry strong copyleft (e.g., PyMuPDF AGPL).
- Impact: distribution restrictions.
- Approach: audit before bundling; prefer permissive alternatives; obtain
  commercial license where required; maintain third-party notices.
- Testing: legal review gate before release.

## R10 Low-RAM Performance
- Description: min target is tight.
- Impact: slow UX or OOM.
- Approach: low-RAM profile, on-demand engines, cache limits, streaming,
  diagnostics panel.
- Testing: performance tests on min target hardware.

## R11 Application Updates
- Description: bad update can break install.
- Impact: users stuck.
- Approach: signed updates, staged rollout, rollback, crash-safe migration.
- Testing: upgrade/downgrade scenarios; simulated failures.

## R12 Data Recovery
- Description: corruption risks.
- Impact: data loss.
- Approach: autosave, snapshots, crash recovery, verified backups, no
  auto-delete of originals.
- Testing: crash injection; recovery drills; integrity checks.

## R13 Trial/License Tampering
- Description: local clock/state tampering.
- Impact: revenue loss.
- Approach: signed local trial, server validation on activation, reasonable
  detection without harming legitimate offline users.
- Testing: adversarial scenarios.

## R14 Python Worker Packaging
- Description: sidecar size, startup, updates.
- Impact: footprint, complexity.
- Approach: lazy spawn, idle shutdown, separate updates, version pinning.
- Testing: packaging tests per OS; worker lifecycle tests.