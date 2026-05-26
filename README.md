<p align="center">
  <picture>
    <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
    <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="OpenCode logo" width="480">
  </picture>
</p>
<p align="center"><strong>n0face's OpenCode Fork</strong> — compose specialized AI agents like a pipeline.</p>

---

## What is n0face-opencode-fork

A feature fork of [OpenCode](https://github.com/sst/opencode) that replaces the two-mode (plan → build) loop with a **10-mode composable pipeline**. Each mode is an independent, self-contained prompt file with a single responsibility — manager, design, frontend, backend, database, security, testing, devops, cleanup, documentation. Modes communicate through shared JSON state and a canonical `project.md` file. You can run them in any order, rerun individual modes, and skip modes entirely.

This is not a plugin or extension — it is the same binary with a different set of system prompts, a reworked TUI (animated mascot, tabbed thinking/result view, three-column home screen), and a config directory isolated to `.n0face/` so it never conflicts with upstream OpenCode.

## Core Philosophy

- **LLM-agnostic by design.** No mode file contains model-specific syntax (no XML tags, no `Claude`/`GPT`/`Gemini` references, no role-play framing). The same 10 prompts work on any LLM that OpenCode supports.
- **State-driven, not chat-driven.** Every mode reads `.n0face/project.md` and its own `state/<mode>.json` at startup, and writes decisions + file lists back at the end. Questions are never re-asked once answered.
- **Single-responsibility modes.** Each mode owns exactly one concern. Manager does not code. Documentation does not design. Cleanup does not deploy. This keeps prompt files tractable and testable.
- **Developer is the approver, not the agent.** Pre-work questions block code/output until answered. Build orders and contracts require explicit developer confirmation. No mode auto-applies fixes.
- **Append-only journal.** All mode activity logs to `.n0face/changelog.md` with a canonical timestamp format. Never edit existing entries. This gives a full audit trail across sessions and modes.
- **Opt-in learning layer.** When `learning_layer: enabled` is set in `project.md`, each mode appends structured session notes (action, rationale, key context) to `.n0face/learn/`. Disabled by default — zero files created unless explicitly enabled.

## Architecture Overview

```
.n0face/
├── agent/             # 10 mode prompt files (the system)
│   ├── manager.md     # intake, planning, cross-mode orchestration
│   ├── design.md      # design system, UI audit, tokens
│   ├── frontend.md    # component implementation
│   ├── backend.md     # API, services, business logic
│   ├── database.md    # schema, migrations, ORM
│   ├── security.md    # vulnerability audit, dependency review
│   ├── testing.md     # test strategy, coverage
│   ├── devops.md      # CI/CD, Docker, deployment
│   ├── cleanup.md     # linting, dead code, performance
│   └── documentation.md  # README, ARCHITECTURE, CONTRIBUTING (terminal)
├── state/             # Per-mode JSON state (touched_files, decisions, last_session)
├── command/           # Slash command files (/new-project, /import-md)
├── skills/            # Imported skill definitions from upstream repos
├── learn/             # Learning layer notes (created only when enabled)
├── project.md         # Canonical project state (modes completed, decisions, known issues)
└── changelog.md       # Append-only session journal
```

Modes share state through two mechanisms:
1. **`project.md`** — modes completed/remaining, architecture decisions, known issues
2. **`state/<mode>.json`** — per-mode touched files, decisions, and last session timestamp

Handoff is conditional: each mode reads `project.md` and checks which modes are completed/remaining before suggesting the next mode.

## Installation

### One-command install (binary)

```bash
curl -fsSL https://raw.githubusercontent.com/n0facearia/n0face-opencode-fork/main/install.sh | bash
```

Downloads a prebuilt binary for linux/darwin on x64/arm64, adds `~/.n0face/bin` to PATH, and installs mode configs to `~/.config/n0face/`. After install, run `n0face` in any project directory.

### One-command uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/n0facearia/n0face-opencode-fork/main/install.sh | bash -s -- --uninstall
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
n0face rebuild
```

Clones/updates source from GitHub, installs dependencies, builds the native binary, and replaces `~/.local/bin/n0face`.

## Configuration

n0face uses the same configuration system as OpenCode but reads from an isolated directory:

- **Project config**: `.n0face/n0face.json` or `.n0face/n0face.jsonc`
- **Global config**: `~/.config/n0face/`

### Setting up an LLM provider

Create `.n0face/n0face.jsonc` in your project root:

```jsonc
{
  "provider": "anthropic",
  "apiKey": "sk-ant-...",
  "model": "claude-sonnet-4-20250514"
}
```

Or use the global config at `~/.config/n0face/n0face.jsonc`:

```bash
mkdir -p ~/.config/n0face
cat > ~/.config/n0face/n0face.jsonc << 'EOF'
{
  "provider": "openai",
  "apiKey": "sk-proj-...",
  "model": "gpt-4o"
}
EOF
```

For environment variables:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-proj-...
```

OpenCode scans for provider key env vars automatically. See the [OpenCode docs](https://opencode.ai/docs) for all available config options.

### Separating from upstream OpenCode

n0face never touches `.opencode/`. You can have both installed side by side:

|                 | `n0face`                   | `opencode`                |
|-----------------|----------------------------|---------------------------|
| Project config  | `.n0face/`                 | `.opencode/`              |
| Global config   | `~/.config/n0face/`        | `~/.config/opencode/`     |
| Agent files     | `.n0face/agent/*.md`       | `.opencode/agent/*.md`    |
| Binary          | `~/.n0face/bin/n0face`     | system-specific path      |

## Supported LLMs

Any provider and model that OpenCode supports works with n0face. The mode files contain no model-specific syntax, so all LLMs produce equivalent behavior:

- **Anthropic**: Claude Sonnet 4, Claude 3.5 Haiku, Claude 3 Opus
- **OpenAI**: GPT-4o, GPT-4o-mini, o3, o4-mini
- **Google**: Gemini 2.5 Pro, Gemini 2.5 Flash
- **AWS**: Bedrock (Claude, Llama, Mistral)
- **GCP**: Vertex AI (Claude, Gemini)
- **OpenAI-compatible**: Together, Fireworks, Groq, DeepSeek, Perplexity, OpenRouter, Ollama (local)
- **Azure**: OpenAI endpoints

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

### Mode workflow

1. **manager** runs first: intake questions, build order, state initialization
2. **design** (if new project): define design system before any code
3. **frontend / backend / database** in parallel or sequence per build order
4. **security / testing / devops** after core implementation
5. **cleanup** before documentation (remove dead code, fix lint)
6. **documentation** last (terminal — reads all prior outputs, no handoff)

Any mode can be skipped. Any mode can be re-run. Handoff reads `project.md` → `Modes remaining` to decide the next mode.

## The Learning Layer

An opt-in cross-session memory system. When enabled in `project.md`:

```yaml
## Settings - learning_layer: enabled
```

Each mode appends structured notes to `.n0face/learn/<mode>.md` after every session:

```markdown
## Session: 2026-05-26 14:30

### Action: <what was done>
**Why:** <rationale>
**What you should know:** <context for future sessions>
**If you want to go deeper:** <suggested next steps>
---
```

- Disabled by default (`learning_layer: disabled`) — no files created, no I/O overhead
- Each entry is separated by `---`
- A 2-minute self-prompt timer encourages richer notes on long sessions
- Modes check the setting at startup; if disabled, they skip the entire section

To enable: edit `project.md` and change `learning_layer: disabled` to `learning_layer: enabled`.

## Development Workflow

### Prerequisites

- **Bun 1.3+** — required for building and development
- **Git** — to clone the repo

### Setup

```bash
git clone https://github.com/n0facearia/n0face-opencode-fork.git
cd n0face-opencode-fork
bun install
```

### Development commands

| Command | What it does |
|---------|-------------|
| `bun dev` | Start TUI dev server (from `packages/opencode`) |
| `bun dev:desktop` | Start Electron desktop app |
| `bun dev:web` | Start web app dev server |
| `bun lint` | Run oxlint across the repo |
| `bun typecheck` | Run TypeScript type checking across all packages |
| `bun run build` | Build the native binary (from `packages/opencode`) |

### Project structure

```
packages/
├── opencode/          # TUI/CLI binary (main entry point)
│   └── src/
│       ├── cli/       # CLI commands, TUI components, routes
│       ├── session/   # Session management, prompt loading
│       ├── tool/      # Tool implementations (plan, read, edit, etc.)
│       └── provider/  # LLM provider integrations
├── app/               # Web application
├── desktop/           # Electron desktop wrapper
├── console/           # Console/web app
├── sdk/               # JavaScript SDK
├── slack/             # Slack integration
└── ui/                # Shared UI components
```

### Making changes to mode prompts

Mode files live in `.n0face/agent/*.md`. To develop or test changes:

1. Edit the relevant `.md` file
2. Test it on a real project (see Testing Requirements in `CONTRIBUTING.md`)
3. If adding a new mode, follow the guide in `CONTRIBUTING.md#how-to-add-a-new-mode`

### Building for release

```bash
cd packages/opencode
bun run build
```

Outputs a native binary suitable for distribution. The `install.sh` script downloads this binary from GitHub Releases.

---

<p align="center">
  Based on <a href="https://github.com/sst/opencode">OpenCode</a> by <a href="https://sst.dev">SST</a>.
</p>
