---
description: Import the mode system into an existing project
---

Import the mode system into an existing project.

Auto-detects project metadata from:
- `package.json` (name, type)
- `Cargo.toml` (name, type)
- `go.mod` (name, type)
- `README.md` (description)

Creates only missing files:
- `PROJECT_SUMMARY.md` (if not exists)
- `MODE_CONTEXT.md` (if not exists)
- `.n0face/` mode files (if not exists)
- `.n0face/agent/` agent configs (if not exists)

Never overwrites existing files.
