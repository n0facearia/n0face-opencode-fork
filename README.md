<p align="center">
  <picture>
    <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
    <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="AM logo" width="480">
  </picture>
</p>
<p align="center"><strong>AM — opencode ultimate fork</strong> — compose specialized AI agents like a pipeline. 11 agent modes with interactive TUI slash commands.</p>

---

## Project Name

**AM — opencode ultimate fork** — a developer-grade, terminal-based AI coding assistant built on [OpenCode](https://github.com/sst/opencode).

## What it does

Replaces the upstream two-mode loop (plan → build) with an **11-mode composable pipeline**. Each mode is an independent prompt file with a single responsibility — manager, design, frontend, backend, database, security, testing, devops, cleanup, documentation. Modes communicate through shared JSON state and a canonical `project.md` file. Run them in any order, rerun individual modes, or skip modes entirely.

Also adds a reworked TUI with animated cat mascot, tabbed thinking/result view, and three-column home screen — all while keeping a config directory isolated to `.am/` so it never conflicts with upstream OpenCode.

## Features

- **11 agent modes** — manager orchestrates, design defines tokens, frontend/backend/database build, security/testing/devops harden, cleanup polishes, documentation synthesizes, chat answers questions
- **LLM-agnostic** — all mode prompts are plain Markdown with zero model-specific syntax. Works with Claude, GPT-4o, Gemini, and any other LLM OpenCode supports
- **Shared state** — modes read/write `project.md` and `state/<mode>.json`; questions are never re-asked
- **Developer approval** — every build order, diff, and destructive action requires confirmation. No auto-apply
- **Append-only changelog** — all sessions log to `.am/changelog.md` with canonical timestamps
- **Opt-in learning layer** — when enabled, each mode writes structured session notes explaining what it did and why
- **Animated mascot** — cat sprites in the session header (idle/thinking/planning states)
- **Tabbed view** — switch between Result and Thinking panels in the TUI
- **Config isolation** — `.am/` directory never touches `.opencode/`; both can coexist
- **Skill system** — 123 imported skill files from 3 upstream repos provide domain-specific patterns
- **Built-in slash commands** — `/modes` opens an interactive mode selector dialog, `/btw` adds context to any session via dialog or inline `/btw some text`
- **Chat mode** — read-only Q&A mode for questions and exploration; no files touched, no state updated

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | [Bun](https://bun.sh) 1.3+ |
| Language | TypeScript (strict mode) |
| TUI framework | [opentui](https://github.com/sst/opentui) (SolidJS) |
| Linter | [oxlint](https://oxc.rs) |
| Test | Vitest |
| Build | [Turbo](https://turbo.build) repo |
| Monorepo | Bun workspaces (20 packages) |

## Prerequisites

- **Bun 1.3+** — required for building and development
- **Git** — to clone the repo

## Installation

### One-command install (binary)

```bash
curl -fsSL https://raw.githubusercontent.com/n0facearia/n0face-opencode-fork/main/install.sh | bash
```

Downloads a prebuilt binary for linux/darwin on x64/arm64 to `~/.local/bin/am`.

### One-command uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/n0facearia/n0face-opencode-fork/main/install.sh | bash -s uninstall
```

### Manual install (full fork — includes TUI customizations)

```bash
git clone https://github.com/n0facearia/n0face-opencode-fork.git
cd n0face-opencode-fork/packages/opencode
bun install
bun run build
```

### Rebuild from source (when already installed)

```bash
am rebuild
```

## Environment Setup

AM uses OpenCode's configuration system with an isolated config directory:

- **Project config**: `.am/am.json` or `.am/am.jsonc`
- **Global config**: `~/.config/am/`

### Setting up an LLM provider

```bash
mkdir -p ~/.config/am
cat > ~/.config/am/am.jsonc << 'EOF'
{
  "provider": "anthropic",
  "apiKey": "sk-ant-...",
  "model": "claude-sonnet-4-20250514"
}
EOF
```

Or use environment variables (auto-detected by OpenCode):

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-proj-...
```

### Separating from upstream OpenCode

AM never touches `.opencode/`. You can have both installed side by side:

|                 | `am`                       | `opencode`                |
|-----------------|----------------------------|---------------------------|
| Project config  | `.am/`                     | `.opencode/`              |
| Global config   | `~/.config/am/`            | `~/.config/opencode/`     |
| Agent files     | `.am/agent/*.md`           | `.opencode/agent/*.md`    |
| Binary          | `~/.local/bin/am`          | system-specific path      |

## Running Locally

```bash
git clone https://github.com/n0facearia/n0face-opencode-fork.git
cd n0face-opencode-fork
bun install
bun dev
```

| Command | What it does |
|---------|-------------|
| `bun dev` | Start TUI dev server (from `packages/opencode`) |
| `bun dev:desktop` | Start Electron desktop app |
| `bun dev:web` | Start web app dev server |
| `bun lint` | Run oxlint across the repo |
| `bun typecheck` | Run TypeScript type checking across all packages |
| `bun run build` | Build the native binary (from `packages/opencode`) |

## Running Tests

Tests must be run from individual package directories, not from repo root:

```bash
cd packages/opencode
bun test
```

Or run type checks:

```bash
cd packages/opencode
bun typecheck
```

## Deployment

The native binary is built and distributed via GitHub Releases. The `install.sh` script downloads the latest release for the target platform.

```bash
cd packages/opencode
bun run build
```

Outputs a standalone binary that is published as a release asset. The auto-update mechanism checks both `n0facearia/n0face-opencode-fork` and `anomalyco/opencode` for new versions on startup.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- How to add a new mode (10-step guide)
- How to add a new skill
- Prompt writing rules (LLM-agnostic, state-driven, canonical formats)
- Testing requirements before submitting

For a full walkthrough of the mode system and available commands, see [TUTORIAL.md](./TUTORIAL.md).

---

## Architecture Overview

```
.am/
├── agent/             # 11 mode prompt files (the system)
│   ├── manager.md     # intake, planning, cross-mode orchestration
│   ├── design.md      # design system, UI audit, tokens
│   ├── frontend.md    # component implementation
│   ├── backend.md     # API, services, business logic
│   ├── database.md    # schema, migrations, ORM
│   ├── security.md    # vulnerability audit, dependency review
│   ├── testing.md     # test strategy, coverage
│   ├── devops.md      # CI/CD, Docker, deployment
│   ├── cleanup.md     # linting, dead code, performance
│   ├── documentation.md  # README, ARCHITECTURE, CONTRIBUTING (terminal)
│   └── chat.md        # Q&A mode — read-only, no state changes
├── state/             # Per-mode JSON state (touched_files, decisions, last_session)
├── command/           # Slash command files (/new-project, /continue-project, /btw, /chat)
├── skills/            # Imported skill definitions from 3 upstream repos
├── learn/             # Learning layer notes (created only when enabled)
├── project.md         # Canonical project state (modes completed, decisions, known issues)
└── changelog.md       # Append-only session journal
```

Modes share state through `project.md` (modes completed/remaining, decisions, known issues) and `state/<mode>.json` (per-mode touched files, decisions, last session). Handoff is conditional: each mode reads `project.md` to determine the next logical mode.

## The Mode System

| Mode | Role | Key Outputs | Color |
|------|------|-------------|-------|
| **manager** | Project intake, planning, sequencing, cross-mode coordination | `project.md`, build orders, mode sequencing | `#F59E0B` |
| **design** | Visual identity, design tokens, component architecture, UI audit | `design-system.md`, token spec, audit report | `#8B5CF6` |
| **frontend** | Component implementation per design system | `FRONTEND.md`, components, cleanup stubs | `#3B82F6` |
| **backend** | API contracts, services, business logic | `API.md`, `BACKEND.md`, ADRs | `#10B981` |
| **database** | Schema design, migrations, ORM config | `DATABASE.md`, ERD, migration files | `#EC4899` |
| **security** | Vulnerability audit, dependency review, threat model | `SECURITY.md` with CVSS + Accepted Risks | `#EF4444` |
| **testing** | Test strategy, coverage targets, test implementation | `TESTING.md`, test files | `#A855F7` |
| **devops** | CI/CD, Docker, deployment, infrastructure | `DEVOPS.md`, workflow specs, runbook | `#06B6D4` |
| **cleanup** | Lint issue resolution, dead code removal, performance | lint diff, cleanup plan, state JSON | `#6B7280` |
| **documentation** | Synthesis into polished docs (terminal — no handoff) | `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md` | `#10B981` |
| **chat** | Read-only Q&A. No files touched, no state updated | Answers to the user | `#6B7280` |

### Mode workflow

1. **manager** runs first: intake questions, build order, state initialization
2. **design** (if new project): define design system before any code
3. **frontend / backend / database** in parallel or sequence per build order
4. **security / testing / devops** after core implementation
5. **cleanup** before documentation (remove dead code, fix lint)
6. **documentation** last (terminal — reads all prior outputs, no handoff)
7. **chat** at any time — read-only Q&A, no state changes, no handoff

Any mode can be skipped. Any mode can be re-run. Chat mode can be used mid-pipeline without disrupting the build order. Handoff reads `project.md` → `Modes remaining` to decide the next mode.

## Slash Commands

AM adds several built-in slash commands accessible by typing `/` in the prompt:

| Command | Behavior |
|---------|----------|
| `/modes` | Opens an interactive mode selector dialog. Tab/arrow keys to navigate, Enter to switch modes. No inline mode switching. |
| `/btw` | Opens a text input dialog to add context to the current session. Also works inline: `/btw handle the null case too` sends the text as additional context to the LLM. |
| `/chat` | Switches to chat mode. Inline: `/chat how does the auth middleware work?` |
| `/new-project` | Scaffolds a new project with the full 11-mode system |
| `/continue-project` | Imports the mode system into an existing project |

Built-in slash commands (with interactive dialogs) take priority over markdown command files when selected from autocomplete. Markdown files handle inline usage when typed directly.

## How It Works

The entire system is a **state machine driven by Markdown files**. Modes never talk to each other directly — they read and write to a shared filesystem state, then suggest the next mode.

### The session lifecycle

```
                  ┌────────────────────────────┐
                  │  NEW PROJECT?              │
                  │                            │
                  │  ┌─ /new-project           │
                  │  │   scaffolds .am/        │
                  │  │   creates project.md    │
                  │  │   initializes state/    │
                  │  └─────────────────────────│
                  │                            │
                  │  ┌─ /continue-project      │
                  │  │   imports into existing │
                  │  │   project, detects      │
                  │  │   metadata, creates     │
                  │  │   only missing files    │
                  │  └─────────────────────────│
                  │                            │
                  │  Then run:  am             │
                  └────────────┬───────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────┐
│  MANAGER reads project.md (created by setup)    │
│                                                  │
│  1. Asks intake questions (project type,         │
│     stack, goals, constraints)                   │
│  2. Writes build order into project.md           │
│  3. Initializes state/<mode>.json for each mode  │
│  4. Sets Modes remaining in project.md           │
│  5. Hands off → suggest <first_mode>             │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│  Each mode executes independently                │
│                                                  │
│  1. Read project.md (state of the world)         │
│  2. Read state/<mode>.json (prior session)       │
│  3. Ask pre-work questions (blocks until answered)│
│  4. Do the work (code, docs, config)             │
│  5. Append to changelog.md                       │
│  6. Write state/<mode>.json (touched files,      │
│     decisions)                                   │
│  7. Update project.md (mark mode completed)      │
│  8. Read project.md → check Modes remaining      │
│  9. Output: ## HANDOFF — suggest <next_mode>     │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│  Next mode repeats the same cycle                │
│                                                  │
│  → design → frontend → backend → database        │
│  → security → testing → devops → cleanup         │
│  → documentation (terminal, no handoff)          │
└─────────────────────────────────────────────────┘
```

### File wiring

Three files connect every mode into a coherent pipeline:

**`project.md`** — the project's memory. Written by manager at intake, updated by every mode on completion. Holds the build order, decisions log, known issues, and the two critical lists: `Modes completed` and `Modes remaining`. Every mode reads this at startup to know what's been done and what's next.

**`state/<mode>.json`** — each mode's private session log. Written at the end of every run. Contains `touched_files`, `decisions` (what was decided and why), and `last_session` (timestamp). On re-runs, the mode reads this file to skip already-answered questions.

**`changelog.md`** — append-only journal of every mode action across all sessions. Entries are never edited, only appended. Format:

```
## [YYYY-MM-DD HH:MM] — <mode> mode
- <action performed>
- <decision made and rationale>
- Files touched: <comma-separated>
- Suggested next: <mode> — <reason>
```

### Mode internals

Every mode file is a self-contained prompt with exactly 11 sections in order:

| # | Section | What it does |
|---|---------|-------------|
| 1 | **ROLE** | One-paragraph definition of the mode's responsibility and boundaries |
| 2 | **STARTUP BEHAVIOR** | Reads `project.md` and `state/<mode>.json`; blocks if missing |
| 3 | **PRE-WORK QUESTIONS** | Blocking questions that pause until answered clearly |
| 4 | **WORKFLOW** | Step-by-step execution process |
| 5 | **OUTPUTS** | Every file the mode creates or modifies |
| 6 | **CHANGELOG** | Canonical entry format to use |
| 7 | **STATE** | What to read/write in `state/<mode>.json` |
| 8 | **LEARNING LAYER** | Conditional — only runs when `learning_layer: enabled` |
| 9 | **HANDOFF** | Reads `project.md`, suggests next mode |
| 10 | **NEVER RE-ASK** | Guard against repeating answered questions |
| 11 | **BOUNDARIES** | Explicit list of what the mode does NOT do |

### Handoff mechanics

The last line of every mode's output (except documentation, which is terminal) is:

```
## HANDOFF — suggest <mode>
```

The handoff logic reads `project.md` — specifically `Modes completed`, `Modes remaining`, and `Known issues` — and decides the next mode based on what's left. If `Known issues` lists a security concern, security mode runs before testing. If an issue blocks the pipeline, the handoff suggests manager to re-plan.

This is not a fixed pipeline. The manager's build order defines the sequence, but any mode can suggest a different next mode based on current state.

### Build order flexibility

The manager creates a build order during intake, but you can override it at any time:

```
Edit project.md → change Modes remaining order → next handoff follows it
```

This means:
- **Skip modes**: remove a mode from `Modes remaining`
- **Re-run modes**: clear a mode from `Modes completed` (it will re-run with fresh state)
- **Re-order**: change the sequence to match your priorities
- **Mid-project pivot**: add a new mode mid-stream by editing `project.md`

### Why this works

The file-based design means the system is **fully transparent, fully inspectable, and fully editable** at every step. You can open `project.md` at any point and see exactly what's been done, what's pending, and what decisions were made. No hidden state, no database, no lock-in.

## Core Philosophy

- **LLM-agnostic by design.** No mode file contains model-specific syntax. The same 10 prompts work on any LLM that OpenCode supports.
- **State-driven, not chat-driven.** Every mode reads `project.md` and its state JSON at startup, writes decisions back at the end. Questions are never re-asked.
- **Single-responsibility modes.** Each mode owns exactly one concern. Manager does not code. Documentation does not design. Cleanup does not deploy.
- **Developer is the approver, not the agent.** Pre-work questions block code until answered. Build orders require confirmation. No mode auto-applies fixes.
- **Append-only journal.** All mode activity logs to `changelog.md` with canonical timestamps. Never edit existing entries.
- **Opt-in learning layer.** When enabled in `project.md`, each mode writes structured session notes. Disabled by default — zero files created.

## The Learning Layer

An opt-in cross-session memory system. When enabled in `project.md`:

```yaml
## Settings - learning_layer: enabled
```

Each mode appends structured notes to `.am/learn/<mode>.md` after every session:

```markdown
## Session: 2026-05-26 14:30

### Action: <what was done>
**Why:** <rationale>
**What you should know:** <context for future sessions>
**If you want to go deeper:** <suggested next steps>
---
```

- Disabled by default (`learning_layer: disabled`) — no files created, no I/O overhead
- A 2-minute self-prompt timer encourages richer notes on long sessions
- Modes check the setting at startup; if disabled, they skip the entire section

To enable: edit `project.md` and change `learning_layer: disabled` to `learning_layer: enabled`.

## Supported LLMs

Any provider and model that OpenCode supports works with AM:

- **Anthropic**: Claude Sonnet 4, Claude 3.5 Haiku, Claude 3 Opus
- **OpenAI**: GPT-4o, GPT-4o-mini, o3, o4-mini
- **Google**: Gemini 2.5 Pro, Gemini 2.5 Flash
- **AWS**: Bedrock (Claude, Llama, Mistral)
- **GCP**: Vertex AI (Claude, Gemini)
- **OpenAI-compatible**: Together, Fireworks, Groq, DeepSeek, Perplexity, OpenRouter, Ollama (local)
- **Azure**: OpenAI endpoints

---

<p align="center">
  Based on <a href="https://github.com/sst/opencode">OpenCode</a> by <a href="https://sst.dev">SST</a>.
</p>
