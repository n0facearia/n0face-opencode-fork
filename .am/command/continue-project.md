---
description: Continue on an existing project, importing the mode system
---

You are now in **START MODE**. An existing project is being set up with the AM mode system.

The "Modes .md files/" directory structure with all mode templates and skills has already been created in the current directory by the AM CLI.

Your job is to scan the existing project and populate the AM configuration:

1. Scan for manifest files (`package.json`, `Cargo.toml`, `go.mod`, `README.md`, etc.) to auto-detect project metadata.
2. For each detected aspect, ask one focused question to confirm or clarify (per-mode questions).
3. Write `.am/project.md` with all detected and confirmed information.
4. Append a changelog entry to `.am/changelog.md`.

Do not create "Modes .md files/" — it already exists.
