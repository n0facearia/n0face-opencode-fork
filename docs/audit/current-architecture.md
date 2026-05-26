# Current Architecture Audit: opencode-ui (n0face fork)

Generated: 2026-05-25
Base upstream: https://github.com/sst/opencode (v1.14.48)
Fork: https://github.com/n0facearia/n0face-opencode-fork

## 1. Repository Overview

### 1.1 Top-Level Layout

```
opencode-ui/
├── packages/          # Monorepo workspace packages (Bun workspaces)
├── .opencode/         # Runtime opencode configuration for this repo
├── .n0face/           # Target n0face architecture mode definitions
├── specs/             # Design specs (project.md, v2/ session & todo schemas)
├── script/            # Root-level scripts (CI, publishing, stats, format, etc.)
├── docs/              # Project documentation (audit/, and other docs)
├── sdks/              # VS Code extension SDK
├── infra/             # SST infrastructure definitions
├── nix/               # Nix flake files
├── github/            # GitHub Actions scripts
├── patches/           # Patch files (git patches)
├── node_modules/      # Workspace root node_modules
├── bun.lock           # Bun lockfile
├── turbo.json         # Turborepo config
├── tsconfig.json      # Root TS config
├── package.json       # Root package.json (workspace definitions)
├── CONTEXT.md         # Fork-specific AI context (mascot, tabs, home)
├── AGENTS.md          # AI agent instructions
├── install            # Binary install script
├── install.sh         # Shell installer
├── rebuild.sh         # Rebuild script
└── README.md          # Main readme
```

### 1.2 Git Remotes

- `origin` → `https://github.com/sst/opencode.git` (upstream)
- `my-fork` → `https://github.com/n0facearia/n0face-opencode-fork` (fork)

### 1.3 Package Manager

Bun v1.3.13 with workspaces. The root `package.json` has a `workspaces.packages` array and a `workspaces.catalog` dict for shared dependency versions (pnpm-style catalog).

### 1.4 Build System

Turborepo (`turbo.json`) orchestrates typechecking across packages.

## 2. Package Map

### 1.5 Root-Level Directories

#### `specs/`
```
specs/
├── project.md            # High-level project specification
└── v2/
    ├── session.md        # V2 session model design
    └── todo.md           # V2 todo system design
```

#### `script/`
```
script/
├── beta.ts               # Beta release management
├── changelog.ts          # Changelog generation
├── duplicate-pr.ts       # Duplicate PR detection
├── format.ts             # Code formatting
├── generate.ts           # Code generation
├── publish.ts            # Package publishing
├── raw-changelog.ts      # Raw changelog
├── stats.ts              # Repository statistics
├── sync-zed.ts           # Zed extension sync
├── upgrade-opentui.ts    # OpenTUI version upgrade
├── version.ts            # Version management
├── sign-windows.ps1      # Windows code signing
├── github/               # GitHub-related scripts
├── hooks                 # Git hook scripts
└── release               # Release automation
```

### 2.1 `packages/opencode` — CLI Core (named `n0face`)

**package.json name**: `n0face`  
**binary**: `bin/n0face` (Go-compiled binary launcher, JS bootstrap script that locates and spawns the correct platform-specific binary)
**entry**: `src/index.ts` — yargs-based CLI
**version**: 1.14.48
**scripts**: dev, test, build, typecheck (tsgo), db (drizzle-kit)

**Subcommand map** (from `src/index.ts`):
| Command | File | Purpose |
|---------|------|---------|
| `run` | `cli/cmd/run` | Interactive AI session (TUI or non-interactive) |
| `generate` | `cli/cmd/generate` | Generate structured output |
| `tui` | `cli/cmd/tui/attach` | Attach to running TUI |
| `serve` | `cli/cmd/serve` | Start HTTP server |
| `web` | `cli/cmd/web` | Web interface |
| `account` | `cli/cmd/account` | Account management |
| `providers` | `cli/cmd/providers` | Provider management |
| `agent` | `cli/cmd/agent` | Agent subcommands |
| `models` | `cli/cmd/models` | List available models |
| `upgrade` | `cli/cmd/upgrade` | Self-upgrade |
| `rebuild` | `cli/cmd/rebuild` | Rebuild |
| `uninstall` | `cli/cmd/uninstall` | Self-uninstall |
| `debug` | `cli/cmd/debug` | Debug commands |
| `mcp` | `cli/cmd/mcp` | MCP server management |
| `github` | `cli/cmd/github` | GitHub integration |
| `export` | `cli/cmd/export` | Export sessions |
| `import` | `cli/cmd/import` | Import sessions |
| `pr` | `cli/cmd/pr` | PR management |
| `session` | `cli/cmd/session` | Session management |
| `db` | `cli/cmd/db` | Database commands |
| `plugin` | `cli/cmd/plug` | Plugin management |
| `stats` | `cli/cmd/stats` | Statistics |
| `acp` | `cli/cmd/acp` | Agent Communication Protocol |

**Source directory structure** (42 top-level src directories):
```
src/
├── account/          # Account/API key management
├── acp/              # Agent Communication Protocol
├── agent/            # Agent system (subagents, prompts, permissions)
├── auth/             # Authentication (OAuth, tokens)
├── background/       # Background job runner
├── bus/              # Event bus system
├── cli/              # CLI/TUI implementation
│   ├── cmd/          # Command implementations
│   │   ├── run/      # AI run command (non-TUI)
│   │   ├── tui/      # TUI subsystem (Solid.js)
│   │   │   ├── component/   # UI components
│   │   │   ├── config/      # TUI config
│   │   │   ├── context/     # TUI contexts
│   │   │   ├── feature-plugins/ # Home, sidebar, system plugins
│   │   │   ├── plugin/      # Plugin system
│   │   │   ├── routes/      # Route screens
│   │   │   ├── ui/          # UI utilities
│   │   │   └── util/        # TUI utilities
│   │   └── debug/           # Debug commands
│   ├── effect/       # CLI Effect runtime
│   ├── error.ts      # Error formatting
│   ├── heap.ts       # Heap profiling
│   ├── logo.ts       # Logo/mascot rendering
│   └── ui.ts         # CLI UI helpers
├── command/          # Command parsing system
├── config/           # Configuration system (23 files)
├── control-plane/    # Control plane integration
├── effect/           # Effect service definitions
├── env/              # Environment management
├── file/             # File system operations
├── format/           # Output formatting
├── git/              # Git integration
├── id/               # ID generation (ulid)
├── ide/              # IDE integration (VS Code, etc.)
├── image/            # Image processing
├── installation/     # Installation management
├── lsp/              # Language Server Protocol integration
├── mcp/              # Model Context Protocol
├── patch/            # Patch application
├── permission/       # Permission system
├── plugin/           # Plugin system (load, install, auth)
├── project/          # Project/workspace management
├── provider/         # AI provider integration layer
├── pty/              # PTY terminal (bun native + node fallback)
├── question/         # Question/query system
├── reference/        # File reference/context system
├── server/           # HTTP server implementation
│   ├── routes/       # API routes
│   │   └── instance/httpapi/  # HTTP API (Hono-based)
│   └── shared/       # Shared server utilities
├── session/          # Session management
│   └── prompt/       # System prompt templates (.txt files)
├── share/            # Session sharing
├── shell/            # Shell integration
├── skill/            # Skill system
│   └── prompt/       # Skill-specific prompts
├── snapshot/         # Session snapshots
├── storage/          # SQLite database (Drizzle ORM)
├── sync/             # Sync system
├── tool/             # Tool definitions & registry
│   └── shell/        # Shell tool
├── util/             # Utilities
├── v2/               # V2 message/session model
├── worktree/         # Git worktree support
└── index.ts          # CLI entry point
└── temporary.ts      # Temporary dev entry
```

**Source file count**: ~500+ TypeScript source files  
**Test file count**: ~240 test files  
**Binary**: Go-compiled binary, not TypeScript. The `bin/n0face` script is a Node.js bootstrap that locates the correct platform binary.

### 2.2 `packages/core` — `@opencode-ai/core`

Shared core utilities used across packages.

```
src/
├── cross-spawn-spawner.ts  # Cross-platform spawn
├── effect/
│   ├── logger.ts           # Effect-based logging
│   ├── memo-map.ts         # Memoization
│   ├── observability.ts    # OpenTelemetry
│   └── runtime.ts          # Effect runtime
├── filesystem.ts           # File system abstractions
├── flag/flag.ts            # Feature flags (trino-based)
├── global.ts               # Global path state
├── installation/version.ts # Version detection
├── npm-config.ts           # NPM config
├── npm.ts                  # NPM operations
├── process.ts              # Process helpers
├── schema.ts               # Shared schemas
└── util/                   # Various utilities
```

### 2.3 `packages/llm` — `@opencode-ai/llm`

Effect Schema-first LLM core. A standalone package that wraps AI provider protocols with Effect schemas.

```
src/
├── index.ts           # Exports
├── llm.ts             # Request constructors
├── provider.ts        # Provider.make
├── tool-runtime.ts    # Tool execution runtime
├── tool.ts            # Tool helper
├── schema/            # Canonical Schema model
│   ├── ids.ts         # Branded IDs
│   ├── options.ts     # Generation options
│   ├── messages.ts    # Message types
│   ├── events.ts      # LLM events
│   └── errors.ts      # Error types
├── route/             # Route system
│   ├── client.ts      # Route.make, LLMClient
│   ├── executor.ts    # RequestExecutor
│   ├── protocol.ts    # Protocol type
│   ├── endpoint.ts    # Endpoint construction
│   ├── auth.ts        # Auth strategies
│   ├── auth-options.ts# Auth option helpers
│   ├── framing.ts     # SSE/AWS event-stream framing
│   └── transport/     # HTTP + WebSocket transports
├── protocols/         # Provider protocol implementations
│   ├── openai-chat.ts
│   ├── openai-responses.ts
│   ├── anthropic-messages.ts
│   ├── gemini.ts
│   ├── bedrock-converse.ts
│   ├── openai-compatible-chat.ts
│   └── utils/         # Shared protocol helpers
├── providers/         # Provider definitions
│   ├── openai.ts, anthropic.ts, google.ts,
│   │   azure.ts, amazon-bedrock.ts, xai.ts,
│   │   openrouter.ts, github-copilot.ts,
│   │   cloudflare.ts, openai-compatible.ts,
│   │   openai-compatible-profile.ts
│   └── index.ts
└── cache-policy.ts    # Cache policy
```

**Protocols supported**: OpenAI Chat, OpenAI Responses, Anthropic Messages, Gemini, Bedrock Converse, OpenAI-compatible Chat  
**Providers supported**: OpenAI, Anthropic, Google, Azure, Amazon Bedrock, xAI, OpenRouter, GitHub Copilot, Cloudflare, DeepSeek, TogetherAI, Cerebras, Baseten, Fireworks, DeepInfra, Groq, Mistral, Perplexity, Cohere, Alibaba, and more via openai-compatible.

### 2.4 `packages/plugin` — `@opencode-ai/plugin`

Public plugin SDK for creating opencode plugins.

```
src/
├── index.ts       # Main exports
├── shell.ts       # Shell plugin type
├── tool.ts        # Tool definition helper
├── tui.ts         # TUI plugin types
├── example.ts     # Example plugin
└── example-workspace.ts  # Workspace plugin example
```

### 2.5 `packages/ui` — `@opencode-ai/ui`

Shared UI components (Solid.js), rendering library for the web/desktop apps.

```
src/
├── components/     # 60+ UI components (accordion, button, card, dialog, markdown, etc.)
├── context/        # Solid.js contexts (data, dialog, file, i18n, etc.)
├── hooks/          # Custom hooks
├── i18n/           # Internationalization (18 languages)
├── pierre/         # Diff/review system (commented-lines, diffs, etc.)
├── storybook/      # Storybook fixtures
├── styles/         # CSS (base, colors, animations, tailwind, theme)
├── theme/          # Theme system (40+ themes)
└── assets/         # Icons (file types, providers) and images
```

### 2.6 `packages/sdk` — `@opencode-ai/sdk`

Client SDK for communicating with the opencode server.

```
js/src/
├── client.ts        # HTTP client
├── server.ts        # Server connection
├── process.ts       # Process management
├── index.ts         # Exports
└── error-interceptor.ts # Error handling
```

### 2.7 `packages/http-recorder` — `@opencode-ai/http-recorder`

HTTP recording/replay system for testing LLM provider interactions.

```
src/
├── cassette.ts      # Cassette file format
├── effect.ts        # Effect integration
├── index.ts         # Exports
├── matching.ts      # Request matching
├── recorder.ts      # Recording logic
├── redaction.ts     # Sensitive data redaction
├── redactor.ts      # Redaction rules
├── schema.ts        # Schema
└── websocket.ts     # WebSocket support
```

### 2.8 `packages/script` — `@opencode-ai/script`

Script utilities (single file: `src/index.ts`).

### 2.9 `packages/slack` — Slack integration

Slack bot integration.

### 2.10 `packages/console` — Landing page website

Marketing site at `app/`. Built with Solid.js + Tailwind. Contains brand assets, landing components, FAQs, and email signup.

### 2.11 `packages/web` — Documentation website

Astro-based documentation site. Contains docs in mdx format, i18n support, component demos.

### 2.12 `packages/docs` — Core documentation content

MDX documentation files covering essentials (code, images, markdown, navigation, settings, reusable snippets), AI tools pages, development guide, etc.

### 2.13 `packages/desktop` — Electron desktop app

Electron-based desktop wrapper for opencode. Contains electron-builder config, icons, main/preload sources.

### 2.14 `packages/app` — Web app (Solid.js, deployed)

Solid.js web application build (pre-built `dist/` directory). Contains assets (fonts, sounds), built entry points, and headers config.

### 2.15 `packages/enterprise` — Enterprise web app

SolidJS enterprise web application with SQLite storage in browser, session sharing, and a separate test suite.

### 2.16 `packages/storybook` — Component Storybook

Storybook configuration and playground for the UI component library.

### 2.17 `packages/identity` — Brand identity assets

SVG and PNG logos/marks at various sizes.

### 2.18 `packages/extensions` — Editor extensions

Currently only contains a Zed editor extension (`zed/`).

### 2.19 `packages/containers` — Docker containers

Dockerfiles for various build environments (base, bun-node, publish, rust, tauri-linux).

### 2.20 `packages/function` — SST function

Single SST function (`src/api.ts`).

## 3. Existing Systems (Detailed)

### 3.1 Mode/Agent Architecture

**File**: `packages/opencode/src/agent/agent.ts`

The agent system uses Effect to manage AI agent lifecycle:
- Agent configuration is defined in the `opencode.jsonc` file
- Agents have frontmatter-defined properties (mode, model, color, tools, hidden)
- Three built-in agent types exist in `.opencode/agent/`: `triage.md`, `duplicate-pr.md`
- The `.opencode/command/` directory defines 8 commands (commit, learn, issues, changelog, translate, ai-deps, spellcheck, rmslop) that are loaded as agent instructions
- Custom prompts exist in `src/agent/prompt/` (compaction, explore, scout, summary, title)
- The system uses the concept of "subagents" (forked AI agents with their own prompts)

**n0face-mode agents** (in `.n0face/`):
- `cleanup.mode.md` — Code quality agent (green)
- `design.mode.md` — UI/UX design agent (purple)
- `security.mode.md` — Security audit agent (red)

These are NOT loaded by the current runtime — they are the *target architecture* definitions.

### 3.2 Prompt Loading System

**File**: `packages/opencode/src/session/prompt.ts` (2135 lines)

The system loads prompts from multiple sources:
1. **Static prompt templates**: `src/session/prompt/*.txt` (12 files)
   - `default.txt` — Base system prompt
   - `anthropic.txt` — Anthropic-optimized version
   - `gpt.txt` — GPT-optimized version
   - `gemini.txt` — Gemini-optimized version
   - `kimi.txt` — Kimi-optimized version
   - `copilot-gpt-5.txt` — GitHub Copilot version
   - `codex.txt` — Codex version
   - `trinity.txt` — Trinity model
   - `beast.txt` — Beast model
   - `plan.txt` — Plan mode prompt
   - `plan-reminder-anthropic.txt` — Plan mode reminder for Anthropic
   - `build-switch.txt` — Build mode switch prompt
   - `max-steps.txt` — Max steps control
2. **Per-model prompts**: `src/session/prompt/` directory is scanned for model-specific overrides
3. **Agent command prompts**: `.opencode/command/*.md` files with YAML frontmatter
4. **Agent definition prompts**: `.opencode/agent/*.md` files
5. **Skill prompts**: `src/skill/prompt/` and `.opencode/skills/`
6. **Inline tool descriptions**: `src/tool/*.txt` files (apply_patch, edit, glob, grep, lsp, plan-enter, plan-exit, question, read, repo_clone, repo_overview, shell, skill, task, todowrite, webfetch, websearch, write)

### 3.3 Tool Calling System

**Files**: `packages/opencode/src/tool/`

The tool system uses a registry pattern:
- `registry.ts` — `ToolRegistry` manages tool definitions (Effect-backed)
- `tool.ts` — Core tool types and execution logic
- `schema.ts` — Tool schema definitions
- `json-schema.ts` — JSON schema generation for tools
- `formatter.ts` — Tool output formatter

Built-in tools:
| Tool | File | Description |
|------|------|-------------|
| `read` | `read.ts` | Read files |
| `write` | `write.ts` | Write files |
| `edit` | `edit.ts` | Edit files (exact string replacement) |
| `apply_patch` | `apply_patch.ts` | Apply patches |
| `glob` | `glob.ts` | File pattern matching |
| `grep` | `grep.ts` | Content search |
| `shell` | `shell.ts` | Command execution via PTY |
| `task` | `task.ts` | Sub-agent task delegation |
| `skill` | `skill.ts` | Load skills |
| `question` | `question.ts` | Ask user questions |
| `webfetch` | `webfetch.ts` | Fetch web content |
| `websearch` | `websearch.ts` | Search web |
| `repo_clone` | `repo_clone.ts` | Clone repositories |
| `repo_overview` | `repo_overview.ts` | Repository overview |
| `plan` | `plan.ts` | Plan mode |
| `todo` | `todo.ts` | Todo management |
| `invalid` | `invalid.ts` | Invalid tool handler |
| `truncate` | `truncate.ts` | Truncation tool |
| `truncation-dir` | `truncation-dir.ts` | Truncation directory |
| `lsp` | `lsp.ts` | Language Server Protocol |
| `mcp-websearch` | `mcp-websearch.ts` | MCP web search |
| `external-directory` | `external-directory.ts` | External directory access |

Custom tools (in `.opencode/tool/`):
- `github-triage.ts` — GitHub issue triage
- `github-pr-search.ts` — GitHub PR search

### 3.4 Config System

**File**: `packages/opencode/src/config/` (23 files)

The config system is a layered merge system:
1. **Global config**: `~/.config/opencode/opencode.jsonc`
2. **Project config**: `$PROJECT/.opencode/opencode.jsonc`
3. **Remote config**: URL-based config references
4. **Environment variables**: Override specific config values

Config modules:
| Module | File | Purpose |
|--------|------|---------|
| `Config` | `config.ts` | Main config loader (841 lines, Effect-based) |
| `ConfigAgent` | `agent.ts` | Agent definitions |
| `ConfigAttachment` | `attachment.ts` | File attachments |
| `ConfigCommand` | `command.ts` | Slash commands |
| `ConfigFormatter` | `formatter.ts` | Output formatters |
| `ConfigLayout` | `layout.ts` | Layout configuration |
| `ConfigLSP` | `lsp.ts` | LSP settings |
| `ConfigManaged` | `managed.ts` | Managed config |
| `ConfigMCP` | `mcp.ts` | MCP server config |
| `ConfigModelID` | `model-id.ts` | Model ID utilities |
| `ConfigParse` | `parse.ts` | JSONC parsing |
| `ConfigPaths` | `paths.ts` | Config file paths |
| `ConfigPermission` | `permission.ts` | Permission rules |
| `ConfigPlugin` | `plugin.ts` | Plugin configuration |
| `ConfigProvider` | `provider.ts` | Provider configuration |
| `ConfigReference` | `reference.ts` | Reference configuration |
| `ConfigServer` | `server.ts` | Server settings |
| `ConfigSkills` | `skills.ts` | Skill index |
| `ConfigVariable` | `variable.ts` | Variable substitution |
| `ConfigError` | `error.ts` | Config error types |
| `ConfigEntryName` | `entry-name.ts` | Entry name resolution |
| `ConfigConsoleState` | `console-state.ts` | Console state persistence |

### 3.5 Model Provider System

Multiple layers:
1. **V1 providers** (`packages/opencode/src/provider/`): Legacy provider integration
2. **V2 model system** (`packages/opencode/src/v2/model.ts`): Newer model abstraction
3. **LLM package** (`packages/llm/`): Effect-native, Schema-first LLM core
4. **AI SDK providers**: Direct `@ai-sdk/*` npm packages (29 official + OpenRouter + Venus + gitlab)
5. **Provider transforms** (`packages/opencode/src/provider/transform.ts`): Message/protocol transformation

Provider configuration flows:
- User config in `opencode.jsonc` → `ConfigProvider` → resolves to provider instances
- Provider instances use `@ai-sdk/*` packages for actual API calls
- The `@opencode-ai/llm` package provides an alternative Effect-native path

### 3.6 State Persistence System

**SQLite + Drizzle ORM**:

- **Schema files**: `*.sql.ts` pattern throughout the source
- **Database**: Bun-native SQLite (`src/storage/db.bun.ts`) with fallback to better-sqlite3 (`src/storage/db.node.ts`)
- **Storage service** (`src/storage/storage.ts`): Generic storage CRUD
- **Schema** (`src/storage/schema.sql.ts`, `src/storage/schema.ts`): Database schema definitions
- **JSON migration** (`src/storage/json-migration.ts`): One-time migration from JSON to SQLite

Database tables (from schema):
- Sessions
- Messages
- Parts (message content parts)
- Workspace-state
- Accounts
- Sync events
- Shares
- Various join tables

### 3.7 Terminal Rendering System

**Two modes**:
1. **TUI mode** (interactive): Solid.js + OpenTUI (`@opentui/core`, `@opentui/solid`, `@opentui/keymap`)
   - Full terminal UI with routing, keybindings, rendering
   - Plugin system for TUI extensions
   - Route-based navigation (home, session, etc.)
   - Mascot feature (cat sprites) — n0face fork addition
2. **Non-TUI mode**: Simple text-based CLI (`cli/cmd/run/`)

**TUI Architecture**:
```
packages/opencode/src/cli/cmd/tui/
├── component/         # Reusable UI components
│   └── prompt/       # Prompt component
├── config/           # TUI configuration
├── context/          # UI contexts (theme, etc.)
├── feature-plugins/  # Plugin-based features
│   ├── home/         # Home screen plugin
│   ├── sidebar/      # Sidebar plugin
│   └── system/       # System plugin
├── plugin/           # Plugin loading system
├── routes/           # Route screens
│   └── session/     # Session route
├── ui/               # UI primitives
└── util/             # Utilities
```

### 3.8 Command Parsing

**System file**: `packages/opencode/src/command/`

The command system:
1. Uses yargs for CLI argument parsing (in `src/index.ts`)
2. Parses slash commands (`/command`) during AI sessions
3. Loads commands from `.opencode/command/*.md` with YAML frontmatter
4. Agents can define custom commands via their agent configs
5. Commands support `$ARGUMENTS` placeholder, `!` shell execution prefix, and inline references

**Built-in slash commands** (from `.opencode/command/`):
- `/commit` — Git commit with AI-generated messages
- `/learn` — Extract learnings to AGENTS.md
- `/issues` — Search GitHub issues
- `/changelog` — Generate changelog
- `/translate` — Translate UI strings
- `/ai-deps` — Audit AI SDK dependencies
- `/spellcheck` — Spellcheck markdown
- `/rmslop` — Remove AI-generated "slop" code

**n0face custom commands** (from `.n0face/command/`):
- `/import-md` — Import the n0face mode system into an existing project; auto-detects project metadata (package.json, Cargo.toml, go.mod, README.md) and creates only missing files (PROJECT_SUMMARY.md, MODE_CONTEXT.md, .n0face/ mode files/agents)
- `/new-project` — Scaffold a new project with the full n0face mode system; prompts for project name, type (web/api/cli), technology stack, and description; creates PROJECT_SUMMARY.md, MODE_CONTEXT.md, and .n0face/ directory structure

### 3.9 Existing Skills/Prompts

**File**: `packages/opencode/src/skill/`

Skill system is a plugin mechanism for extending agent capabilities:
- `discovery.ts` — Discovers available skills
- `index.ts` — Skill index/registry
- `prompt/customize-opencode.md` — Skill for customizing opencode config

**Registered skills** (in `.opencode/skills/`):
- `effect/SKILL.md` — Effect framework development guide
- `improve-codebase-architecture/SKILL.md` — Architecture improvement skill (with DEEPENING.md, INTERFACE-DESIGN.md, LANGUAGE.md references)

### 3.10 Existing Workflows

**CI workflows** (`.github/workflows/`):
- Automated testing, typechecking, linting
- Build and release pipeline
- PR checks

**Git hooks** (`.husky/`):
- Pre-commit hooks (likely linting)

### 3.11 Existing Dependencies

**Root catalog** (shared across workspace):
- Effect v4.0.0-beta.65
- Zod v4.1.8
- AI SDK (Vercel) v6.0.168
- Solid.js 1.9.10
- Drizzle ORM 1.0.0-beta
- Hono 4.10.7
- TypeScript 5.8.2
- Various @ai-sdk/* provider packages (29+)
- OpenTUI 0.2.8
- Turbo, Remeda, Shiki, etc.

**Core package** has ~100 direct dependencies including all AI SDK providers, MCP SDK, Octokit, node-pty, Parcel watcher, tree-sitter, etc.

### 3.12 Existing Tests

**Test framework**: Bun test runner
**Test count**: ~240 test files in `packages/opencode/test/`
**Test locations**:
- `test/agent/` — Agent tests
- `test/cli/` — CLI/TUI tests
- `test/config/` — Config tests
- `test/session/` — Session tests
- `test/server/` — HTTP API tests (extensive, with httpapi-exercise DSL)
- `test/tool/` — Tool tests
- `test/provider/` — Provider tests
- `test/storage/` — Storage tests
- `test/plugin/` — Plugin tests
- `test/lsp/` — LSP tests
- `test/mcp/` — MCP tests
- Various util test files

**LLM package tests**: Extensive recorded/replay tests using `@opencode-ai/http-recorder`
- `test/provider/` — Recorded provider tests for each protocol
- `test/recorded-*.ts` — Recording infrastructure

### 3.13 CLI Entry Points

1. **Main binary**: `packages/opencode/bin/n0face` — Node.js bootstrap that resolves platform-specific Go binary
2. **Source entry**: `packages/opencode/src/index.ts` — Yargs CLI parser
3. **Dev entry**: `packages/opencode/src/temporary.ts` — Temporary development entry
4. **Core binary**: `packages/core/bin/opencode` — Alternative entry for `@opencode-ai/core`

### 3.14 Environment Variable Usage

Key environment variables (100+ total):

**Operational**:
- `N0FACE=1` — Set in production binary
- `AGENT=1` — Set in CLI middleware
- `OPENCODE=1` — Set in CLI middleware
- `OPENCODE_PID` — Process ID tracking
- `OPENCODE_PURE` — Pure mode (no external plugins)
- `OPENCODE_FAST_BOOT` — Fast boot mode
- `OPENCODE_CLIENT` — Client type identifier

**Network/Proxy**:
- `HTTP_PROXY`, `HTTPS_PROXY` — Proxy configuration
- `OPENCODE_EDITOR_SSE_PORT` — Editor SSE port
- `CLAUDE_CODE_SSE_PORT` — Claude Code compatibility

**Provider Authentication**:
- `AWS_*` (multiple) — AWS Bedrock auth
- `AZURE_RESOURCE_NAME` — Azure resource
- `EXA_API_KEY` — Exa search API
- `PARALLEL_API_KEY` — Parallel API
- `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_GATEWAY_ID` — Cloudflare AI

**OpenTelemetry**:
- `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`, `OTEL_RESOURCE_ATTRIBUTES`

**Paths**:
- `HOME`, `XDG_CONFIG_HOME`, `PATH`, `SHELL`, `PWD`, `TERM`, `COMSPEC`, `PATHEXT`

**Testing**:
- `OPENCODE_TEST_MANAGED_CONFIG_DIR` — Test config directory
- `OPENCODE_REPO_CLONE_GITHUB_BASE_URL` — Test repo clone base URL

### 3.15 n0face Fork-Specific Additions

From `CONTEXT.md`:
1. **Mascot feature**: Cat sprites in TUI session header (`packages/opencode/src/cli/logo.ts`, `mascot.tsx`)
2. **Tabbed Thinking/Result view**: Two tabs in session header (`session/index.tsx`)
3. **Home screen layout**: Three-column layout with mascot, welcome text, info panel (`home.tsx`)

The `n0face project plan.md` file is empty (placeholder).

## 4. .n0face Directory — Target Architecture

The `.n0face/` directory contains the planned n0face architecture mode definitions:

```
.n0face/
├── package.json              # Dependency: @opencode-ai/plugin@1.15.3
├── cleanup.mode.md           # Code quality agent mode (green)
├── design.mode.md            # UI/UX design agent mode (purple)
├── security.mode.md          # Security audit agent mode (red)
├── agent/
│   ├── cleanup.md            # Cleanup agent config
│   ├── design.md             # Design agent config
│   └── security.md           # Security agent config
└── command/
    ├── import-md.md          # Import mode system command
    └── new-project.md        # New project scaffolding command
```

Each mode defines:
- A comprehensive system prompt with checklists, severity levels, process phases, and commands
- An agent config with YAML frontmatter (mode, color, description)
- Custom commands specific to the mode

The `.n0face/.gitignore` intentionally ignores `package.json` and `package-lock.json` from being committed.

## 5. .opencode Directory — Runtime Configuration

```
.opencode/
├── opencode.jsonc            # Main config (provider, permission, mcp, tools)
├── tui.json                  # TUI plugin config (smoke plugin)
├── env.d.ts                  # Module type declarations
├── package.json              # Dependency: @opencode-ai/plugin@1.14.48
├── agent/
│   ├── triage.md             # GitHub issue triage agent
│   └── duplicate-pr.md       # Duplicate PR detection agent
├── command/                  # Slash commands (8 files)
├── glossary/                 # Translation glossaries (16 languages)
├── plugins/
│   ├── tui-smoke.tsx         # TUI smoke test plugin
│   └── smoke-theme.json      # Smoke test theme
├── skills/
│   ├── effect/               # Effect development skill
│   └── improve-codebase-architecture/  # Architecture skill
├── themes/
│   └── mytheme.json          # Custom theme
├── tool/
│   ├── github-triage.ts      # GitHub triage tool
│   └── github-pr-search.ts   # GitHub PR search tool
```

## 6. Key Architectural Observations

### 6.1 Effect v4 Everywhere
The codebase is deeply integrated with Effect v4 (beta.65). Nearly every service is defined as an Effect Service with layers, managed scopes, and Effect.gen. The LLM package is entirely Effect-native.

### 6.2 Two Conflicting Package Names
- `packages/opencode/package.json` name is `"n0face"` (binary: `n0face`)
- `packages/core/package.json` name is `"@opencode-ai/core"` (binary: `opencode`)
This creates confusion about branding.

### 6.3 Go Binary + TypeScript Source Split
The actual runtime distributed to users is a Go-compiled binary (opencode-<platform>-<arch>). The TypeScript source code in this repo is compiled/bundled into that binary. The `bin/n0face` script locates and spawns the correct binary.

### 6.4 AI SDK v6 + Native Effect LLM
Two parallel LLM stacks exist:
1. Vercel AI SDK (`ai` package + `@ai-sdk/*`) — older/established
2. `@opencode-ai/llm` — newer Effect-native stack

### 6.5 .n0face/ vs .opencode/ Duplication
The `.n0face/` directory defines three modes (cleanup, design, security) that are NOT currently loaded by the runtime. The `.opencode/` directory has two different agents (triage, duplicate-pr). This represents a gap between the current and planned architecture.

### 6.6 Naming: "opencode" vs "n0face"
The `process.env.N0FACE = "1"` flag is set but the project still predominantly uses "opencode" naming (package names, env vars, URLs, branding). Only the binary name and package.json name reflect the n0face rebranding.
