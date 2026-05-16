---
description: Initialize a new project with mode system (design, cleanup, security modes)
---

# /new-project

Initialize a new project with the custom mode system.

## Steps

### 1. Collect project info

Ask the user for:
- **Project name** (directory name to create under current dir, or current dir if empty)
- **Project type** (web, api, cli, library, mobile, etc.)
- **Technology stack** (comma-separated, e.g. "React, TypeScript, Tailwind")
- **Description** (1-2 sentence summary)

If the user provides a project name, create a subdirectory with that name. If they say "." or leave blank, use the current directory.

### 2. Create directory structure

```
mkdir -p {target}/.n0face
mkdir -p {target}/.opencode/agent
```

### 3. Copy mode system files

Read these existing source files from the current repo and write copies into the target:

**Mode prompt files** (source → target):
- `.n0face/design.mode.md` → `{target}/.n0face/design.mode.md`
- `.n0face/cleanup.mode.md` → `{target}/.n0face/cleanup.mode.md`
- `.n0face/security.mode.md` → `{target}/.n0face/security.mode.md`

**Agent config files** (source → target):
- `.opencode/agent/design.md` → `{target}/.opencode/agent/design.md`
- `.opencode/agent/cleanup.md` → `{target}/.opencode/agent/cleanup.md`
- `.opencode/agent/security.md` → `{target}/.opencode/agent/security.md`

### 4. Create PROJECT_SUMMARY.md

Write the following template with the user's info filled in:

```markdown
# PROJECT_SUMMARY

**Project Name:** `{name}`
**Project Type:** {type}
**Technology Stack:** {stack}
**Created:** {current timestamp}
**Status:** 🟡 Project initialized

## Overview
{description}

---

## Planning Phase
- [ ] Requirements defined
- [ ] Architecture planned
- [ ] Design system planned

## Build Progress
- [ ] Core features implemented
- [ ] Integrations complete
- [ ] Testing done

## UI/Design
- [To be audited by Design mode]

## Code Quality
- [To be audited by Cleanup mode]

## Security
- [To be audited by Security mode]

---

Last updated: {current timestamp}
```

### 5. Create MODE_CONTEXT.md

Write this template:

```markdown
# Mode System Context

## Available Modes
- **plan** — Strategic planning and architecture
- **build** — Implementation and development
- **design** — UI/UX and frontend design
- **cleanup** — Code quality and optimization
- **security** — Security audit and hardening

## Usage
- Press **Tab** to cycle through modes
- Type `/mode [name]` to switch directly
- Type `/modes` to list all available modes

## Mode Files
- `.n0face/design.mode.md` — Design audit checklist and workflow
- `.n0face/cleanup.mode.md` — Code quality audit checklist and workflow
- `.n0face/security.mode.md` — Security audit checklist and workflow

## Custom Commands
- Type `/new-project` to re-run project setup
```

### 6. Open in VS Code

Check if running inside VS Code terminal (`echo "$TERM_PROGRAM"` — if it outputs "vscode", or `$VSCODE_PID` is set). Only run `code "{target}"` if running inside VS Code. Otherwise skip this step.

### 7. Report success

Show a summary of what was created:

```
🚀 Project "{name}" initialized

Files created:
  ✓ PROJECT_SUMMARY.md
  ✓ MODE_CONTEXT.md
  ✓ .n0face/design.mode.md
  ✓ .n0face/cleanup.mode.md
  ✓ .n0face/security.mode.md
  ✓ .opencode/agent/design.md
  ✓ .opencode/agent/cleanup.md
  ✓ .opencode/agent/security.md

Toggle modes with Tab or /mode [name]
Available: plan | build | design | cleanup | security

Install the mode system in any project:
  curl -fsSL https://raw.githubusercontent.com/n0facearia/n0face-opencode-fork/main/install.sh | bash
```
