# ARCHITECTURAL DIAGRAMS — DocuVerse Studio

## 1. Overall System Architecture
```mermaid
flowchart TD
  U[Customer] --> UI[React + TS UI]
  UI -->|typed IPC| CORE[Rust Core]
  CORE --> DB[(SQLite)]
  CORE --> FS[(Filesystem Zones)]
  CORE --> JM[Job Manager]
  JM --> W[Python Workers]
  CORE --> PA[Platform Adapters]
  PA --> SC[Scanner / Printer / OS]
  CORE --> LIC[License Verifier]
  UI --> THEME[Theme & Settings]
  THEME --> DB