# n0face's OpenCode Fork

A feature fork of [OpenCode](https://github.com/sst/opencode) — the open source AI coding agent — with custom agent modes, animated mascot, tabbed views, and project setup commands.

---

## One-Command Install

```bash
curl -fsSL https://raw.githubusercontent.com/n0facearia/n0face-opencode-fork/main/install.sh | bash
```

Run this in any project directory to install the custom mode system. It creates:

```
.n0face/
├── design.mode.md      # UI/UX design system prompt
├── cleanup.mode.md     # Code quality system prompt
└── security.mode.md    # Security audit system prompt

.opencode/agent/
├── design.md           # Design agent config
├── cleanup.md          # Cleanup agent config
└── security.md         # Security agent config

TUTORIAL.md             # This file
```

Press **Tab** in OpenCode to cycle through all modes.

---

## Manual Install (Full Fork)

If you want the TUI modifications too (mascot, tabbed views, home screen):

```bash
git clone https://github.com/n0facearia/n0face-opencode-fork.git
cd n0face-opencode-fork/packages/opencode
npm i -g bun
bun install
bun run build
```

Then run `n0face` from anywhere.

---

## What's Different From Upstream

| Feature | Upstream OpenCode | This Fork |
|---------|------------------|-----------|
| **Agent modes** | plan, build | plan, build, **design, cleanup, security** |
| **TUI Mascot** | None | Animated cat sprites |
| **Message tabs** | None | Result / Thinking toggle |
| **Home screen** | Single column | Three-column layout |
| **Mode prompts** | 2 built-in | 5 modes with system prompts |
| **Setup commands** | None | `/new-project`, `/import-md` |
| **Install script** | `curl opencode.ai/install` | `curl raw.githubusercontent.com/...` |

### Custom Agents

| Agent | Color | Purpose |
|-------|-------|---------|
| **design** | Purple `#A855F7` | UI/UX audit, accessibility, animations |
| **cleanup** | Green `#22C55E` | Code quality, dead code, performance |
| **security** | Red `#EF4444` | Vulnerability scan, dependency audit |

### Custom Commands

| Command | Description |
|---------|-------------|
| `/new-project` | Set up a new project with mode system |
| `/import-md` | Import mode system into existing project |

---

## Tutorial

### Starting n0face

```bash
n0face
```

### Switching Modes

Press **Tab** to cycle forward or **Shift+Tab** to cycle backward through:

```
plan → build → design → cleanup → security
```

Each mode changes the AI agent's focus and permissions.

### Mode Descriptions

#### Plan Mode
Read-only analysis and architecture planning. Cannot edit files. Use for:
- Exploring unfamiliar codebases
- Planning architecture changes
- Auditing project structure

#### Build Mode
Full-access development — the default agent. Use for:
- Writing code and tests
- Running commands
- Making any project changes

#### Design Mode
Focuses on UI/UX, accessibility, animations, and visual systems. Use for:
- Running a full UI audit (`/audit`)
- Checking WCAG compliance (`/accessibility`)
- Improving component design (`/components`)
- Previewing design system (`/preview`)

Commands: `/audit`, `/system`, `/accessibility`, `/animations`, `/components`, `/fix`, `/preview`, `/status`

#### Cleanup Mode
Focuses on code quality, removing dead code, and performance optimization. Use for:
- Running a code cleanup analysis (`/cleanup`)
- Finding dead code (`/dead-code`)
- Performance optimization (`/performance`)
- Refactoring suggestions (`/refactor`)

Commands: `/cleanup`, `/dead-code`, `/performance`, `/refactor`, `/fix`, `/metrics`, `/status`

#### Security Mode
Focuses on vulnerability scanning, dependency auditing, and security hardening. Use for:
- Running a full security audit (`/audit`)
- Viewing critical issues only (`/critical`)
- Generating a security report (`/report`)

Commands: `/audit`, `/critical`, `/fix`, `/report`, `/status`

### The Mascot

The cat sprite in the TUI changes based on state:

```
Normal (idle)      Thinking (busy)     Planning mode
┌───────┐          ┌───────┐           ┌───────┐
│ ~ _ ~ │          │ ^ _ ^ │           │  ███  │
└───────┘          └───────┘           └───────┘
```

- **Normal**: Cat with sleepy eyes — waiting for your input
- **Thinking**: Cat with alert eyes — model is streaming or executing tools
- **Planning**: Cat with sunglasses — Plan mode is active

### Tabbed Message Views

In the session header, click **Result** or **Thinking** to toggle between:
- **Result**: Shows the model's text responses and tool outputs
- **Thinking**: Shows the model's reasoning/internal thoughts

### Setting Up a New Project

```bash
cd ~/my-new-project
n0face
```

Then in n0face:

```
/new-project
```

The command asks for:
1. Project name
2. Project type (web, api, cli, etc.)
3. Technology stack
4. Description

It creates `PROJECT_SUMMARY.md`, `MODE_CONTEXT.md`, `.n0face/`, and `.opencode/agent/`.

### Importing Into an Existing Project

```bash
cd ~/my-existing-project
n0face
```

Then in n0face:

```
/import-md
```

This auto-detects your project's name, type, and stack from `package.json`, `Cargo.toml`, `go.mod`, etc., and creates the mode system files without overwriting anything that already exists.

### Result/Thinking Tabs

Each assistant message has two views:
- **Result** (default) — shows the model's reply and tool outputs
- **Thinking** — shows reasoning/scratchpad content (if available)

---

## Project File Reference

| File | Purpose |
|------|---------|
| `.n0face/design.mode.md` | System prompt for Design mode |
| `.n0face/cleanup.mode.md` | System prompt for Cleanup mode |
| `.n0face/security.mode.md` | System prompt for Security mode |
| `.opencode/agent/design.md` | Agent config: frontmatter + prompt body |
| `.opencode/agent/cleanup.md` | Agent config: frontmatter + prompt body |
| `.opencode/agent/security.md` | Agent config: frontmatter + prompt body |
| `PROJECT_SUMMARY.md` | Project-wide status tracking across all modes |
| `MODE_CONTEXT.md` | Mode system reference |

---

## Agent Config Format

Each agent file in `.opencode/agent/` has YAML frontmatter followed by the system prompt body:

```markdown
---
mode: primary
hidden: false
color: "#A855F7"
description: UI/UX design agent
---

Full system prompt here...
```

| Field | Description |
|-------|-------------|
| `mode` | Agent role: `primary` (toggleable), `subagent` (internal), `all` (both) |
| `hidden` | `true` hides from Tab cycling |
| `color` | Hex color or theme color name |
| `description` | Shown in agent selector |
| (body) | System prompt used when this mode is active |

---

## Uninstalling

To remove the custom mode system from a project:

```bash
rm -rf .n0face .opencode/agent/design.md .opencode/agent/cleanup.md .opencode/agent/security.md
rm -f PROJECT_SUMMARY.md MODE_CONTEXT.md TUTORIAL.md
```
