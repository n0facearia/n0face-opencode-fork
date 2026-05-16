---
description: Import mode system into an existing project (auto-detects project info)
---

# /import-md

Import the custom mode system (design, cleanup, security modes) into an existing project. The command will auto-detect project info instead of asking the user.

## Steps

### 1. Set target directory

Use the current working directory as the target. Do not ask the user for a project name.

### 2. Auto-scan the project

Run these shell commands to detect project info and store the results:

```
# Project name
!cat package.json 2>/dev/null | grep '"name"' | head -1 | sed 's/.*"name": *"\([^"]*\)".*/\1/' || basename "$(pwd)"

# Project type
if ls package.json 2>/dev/null; then
  echo "web"
elif ls Cargo.toml 2>/dev/null; then
  echo "cli"  # or "library" based on [[bin]] vs [lib]
elif ls pyproject.toml 2>/dev/null; then
  echo "library"
elif ls go.mod 2>/dev/null; then
  echo "api"
elif ls index.html 2>/dev/null; then
  echo "web"
else
  echo "unknown"
fi

# Tech stack
!cat package.json 2>/dev/null | grep -oP '"(react|vue|svelte|angular|next|nuxt|express|fastify|hono|elysia|tailwind|typescript)"' | tr '\n' ', ' | sed 's/, $//'
!head -5 Cargo.toml 2>/dev/null | grep -oP 'edition = "\K[^"]+' | head -1
!head -3 go.mod 2>/dev/null | grep -oP 'module \K\S+' | head -1

# Description (from README first line)
!head -5 README.md 2>/dev/null | grep -v '^#' | head -1 | sed 's/^ *//; s/ *$//'
!head -5 README 2>/dev/null | head -1
```

Also scan for existing structure:

```
# Existing files to preserve
ls -la .n0face/ 2>/dev/null && echo "EXISTS=.n0face"
ls -la .opencode/agent/ 2>/dev/null && echo "EXISTS=.opencode/agent"
ls PROJECT_SUMMARY.md 2>/dev/null && echo "EXISTS=PROJECT_SUMMARY.md"
```

Analyze the scan results and extract:
- **Project name**: from package.json, or directory basename
- **Project type**: web (has package.json/index.html), api (has go.mod/express), cli (Cargo.toml with [[bin]]), library (Cargo.toml with [lib], pyproject.toml)
- **Tech stack**: detected dependencies, language files
- **Description**: first non-header line of README.md, or a brief summary of what the project appears to do based on file structure
- **Status**: whether files already exist (skip those that already exist)

### 3. Create directory structure (if needed)

```
mkdir -p {target}/.n0face
mkdir -p {target}/.opencode/agent
```

### 4. Copy mode system files

Read these existing source files from the current repo. If the target already has these files, **do not overwrite them** — mention they already exist.

**Mode prompt files** (source → target, skip if exists):
- `.n0face/design.mode.md` → `{target}/.n0face/design.mode.md`
- `.n0face/cleanup.mode.md` → `{target}/.n0face/cleanup.mode.md`
- `.n0face/security.mode.md` → `{target}/.n0face/security.mode.md`

**Agent config files** (source → target, skip if exists):
- `.opencode/agent/design.md` → `{target}/.opencode/agent/design.md`
- `.opencode/agent/cleanup.md` → `{target}/.opencode/agent/cleanup.md`
- `.opencode/agent/security.md` → `{target}/.opencode/agent/security.md`

### 5. Create/update PROJECT_SUMMARY.md

If `PROJECT_SUMMARY.md` already exists, **do not overwrite** — mention it already exists.

Otherwise, write the template with the auto-detected info:

```markdown
# PROJECT_SUMMARY

**Project Name:** `{detected name}`
**Project Type:** {detected type}
**Technology Stack:** {detected stack}
**Created:** {current timestamp}
**Status:** 🟢 Active project

## Overview
{detected description}

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

### 6. Create MODE_CONTEXT.md

If `MODE_CONTEXT.md` already exists, **do not overwrite** — mention it already exists.

Otherwise write:

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
- Type `/new-project` to set up a brand new project
- Type `/import-md` to re-import mode system
```

### 7. Open in VS Code

Check if running inside VS Code terminal (`echo "$TERM_PROGRAM"` — if it outputs "vscode", or `$VSCODE_PID` is set). Only run `code "{target}"` if running inside VS Code. Otherwise skip this step.

### 8. Report success

Show a summary of what was created and what already existed:

```
🚀 Import complete for "{name}"

Created:
  ✓ .n0face/design.mode.md
  ✓ .n0face/cleanup.mode.md
  ✓ .n0face/security.mode.md
  ✓ .opencode/agent/design.md
  ✓ .opencode/agent/cleanup.md
  ✓ .opencode/agent/security.md
  ✓ PROJECT_SUMMARY.md
  ✓ MODE_CONTEXT.md

Skipped (already exists):
  - .opencode/agent/design.md

Toggle modes with Tab or /mode [name]
Available: plan | build | design | cleanup | security

Install the mode system in any project:
  curl -fsSL https://raw.githubusercontent.com/n0facearia/n0face-opencode-fork/main/install.sh | bash
```

If all files already exist, print:

```
ℹ️  Mode system already fully set up in this project.
   Toggle modes with Tab or /mode [name]
```
