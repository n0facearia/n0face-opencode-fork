# Mode Mapping: Current Systems → Planned n0face Architecture

Generated: 2026-05-25

## 1. Mapping Table

| # | Current System | Location | Planned n0face Equivalent | Migration Action |
|---|---|---|---|---|
| 1 | **Agent definitions** | `.opencode/agent/triage.md`, `.opencode/agent/duplicate-pr.md` | `.am/agent/` | **Refactor** — Move agent configs to `.am/agent/` structure; n0face modes (cleanup, design, security) already exist there |
| 2 | **Command definitions** | `.opencode/command/*.md` (8 files) | `.am/command/` | **Refactor** — Move commands; `.am/command/` already has `continue-project.md` and `new-project.md` |
| 3 | **Mode system prompts** | `src/session/prompt/*.txt` (12 provider-specific prompts) | `.am/*.mode.md` | **Refactor** — Replace provider-specific prompts with mode-specific prompts (cleanup, design, security) |
| 4 | **Agent runtime** | `packages/opencode/src/agent/agent.ts` | `packages/n0face/src/agent/` | **Keep** — Core agent runtime is reusable; needs mode-awareness integration |
| 5 | **Config system** | `packages/opencode/src/config/` (23 files) | `.am/` + `packages/n0face/src/config/` | **Keep** — Config system is already Effect-based and layered; needs rebranding |
| 6 | **LLM provider system** | `packages/llm/` (Effect-native) + `packages/opencode/src/provider/` (legacy) | `packages/n0face/llm/` | **Keep** — LLM package is well-architected; needs only path rename |
| 7 | **Tool definitions** | `packages/opencode/src/tool/` (20+ tools) | `packages/n0face/src/tool/` | **Keep** — Tool system is generic/reusable |
| 8 | **Tool descriptors (.txt)** | `packages/opencode/src/tool/*.txt` | `packages/n0face/src/tool/*.txt` | **Keep** — Static tool descriptions are content-agnostic |
| 9 | **Session management** | `packages/opencode/src/session/` | `packages/n0face/src/session/` | **Keep** — Session logic is mode-agnostic |
| 10 | **Memory/persistence** | `packages/opencode/src/storage/` (SQLite + Drizzle) | `.am/state/` | **Refactor** — Extract state schema to `.am/state/`; keep storage engine |
| 11 | **TUI rendering** | `packages/opencode/src/cli/cmd/tui/` (Solid.js + OpenTUI) | `packages/n0face/src/tui/` | **Keep** — TUI is presentation layer; needs rebranding |
| 12 | **CLI entry points** | `packages/opencode/src/index.ts` (yargs) | `packages/n0face/src/index.ts` | **Keep** — CLI structure is fine; needs rebranding |
| 13 | **Binary launcher** | `packages/opencode/bin/n0face` | `packages/n0face/bin/n0face` | **Keep** — Binary bootstrap is already named `n0face` |
| 14 | **Plugin system** | `packages/opencode/src/plugin/` + `packages/plugin/` (SDK) | `packages/n0face/src/plugin/` | **Keep** — Plugin architecture is extensible and mode-agnostic |
| 15 | **MCP integration** | `packages/opencode/src/mcp/` | `packages/n0face/src/mcp/` | **Keep** — Protocol-agnostic |
| 16 | **Skill system** | `packages/opencode/src/skill/` + `.opencode/skills/` | `.am/skills/` | **Refactor** — Move skills under `.am/` |
| 17 | **Project/workspace** | `packages/opencode/src/project/` | `packages/n0face/src/project/` | **Keep** — Workspace management is reusable |
| 18 | **Auth system** | `packages/opencode/src/auth/` | `packages/n0face/src/auth/` | **Keep** — Auth is provider-agnostic |
| 19 | **HTTP server** | `packages/opencode/src/server/` (Hono-based) | `packages/n0face/src/server/` | **Keep** — Server is infrastructure |
| 20 | **Sync system** | `packages/opencode/src/sync/` | `packages/n0face/src/sync/` | **Keep** — Sync is data-layer |
| 21 | **Share system** | `packages/opencode/src/share/` | `packages/n0face/src/share/` | **Keep** — Sharing is feature-complete |
| 22 | **Git integration** | `packages/opencode/src/git/` | `packages/n0face/src/git/` | **Keep** — Git operations are generic |
| 23 | **LSP integration** | `packages/opencode/src/lsp/` | `packages/n0face/src/lsp/` | **Keep** — LSP is language-agnostic |
| 24 | **PTY subsystem** | `packages/opencode/src/pty/` | `packages/n0face/src/pty/` | **Keep** — Terminal PTY is system-level |
| 25 | **Event bus** | `packages/opencode/src/bus/` | `packages/n0face/src/bus/` | **Keep** — Event bus is core infrastructure |
| 26 | **Permission system** | `packages/opencode/src/permission/` | `packages/n0face/src/permission/` | **Keep** — Security model is reusable |
| 27 | **Effect services** | `packages/opencode/src/effect/` (11 files) | `packages/n0face/src/effect/` | **Keep** — Effect services are infrastructure |
| 28 | **V2 message model** | `packages/opencode/src/v2/` | `packages/n0face/src/v2/` | **Keep** — Message/session data model |
| 29 | **Shared UI components** | `packages/ui/` (Solid.js) | `packages/n0face/ui/` | **Keep** — UI components are presentation layer |
| 30 | **Client SDK** | `packages/sdk/` | `packages/n0face/sdk/` | **Keep** — API client is protocol-specific, not mode-specific |
| 31 | **HTTP recorder** | `packages/http-recorder/` | `packages/n0face/http-recorder/` | **Keep** — Testing infrastructure |
| 32 | **Glossary/i18n** | `.opencode/glossary/` (16 languages) | `.am/glossary/` | **Refactor** — Move translation glossaries to `.am/` |
| 33 | **Themes** | `.opencode/themes/` + `packages/ui/src/theme/` | `.am/themes/` | **Refactor** — Move custom themes to `.am/` |
| 34 | **UI config** | `.opencode/tui.json` | `.am/tui.json` | **Refactor** — Move TUI config to `.am/` |
| 35 | **Main config** | `.opencode/opencode.jsonc` | `.am/n0face.jsonc` | **Refactor** — Rename to n0face config |
| 36 | **Env declarations** | `.opencode/env.d.ts` | `.am/env.d.ts` | **Refactor** — Move type declarations |
| 37 | **Custom tools** | `.opencode/tool/github-triage.ts`, `github-pr-search.ts` | `.am/tool/` | **Refactor** — Move custom tools to `.am/` |
| 38 | **Plugins** | `.opencode/plugins/` | `.am/plugins/` | **Refactor** — Move plugins to `.am/` |
| 39 | **Package dependencies** | `.opencode/package.json` | `.am/package.json` | **Keep** — Already mostly duplicated; `.am/package.json` already exists |
| 40 | **Installation system** | `packages/opencode/src/installation/` | `packages/n0face/src/installation/` | **Keep** — Installation logic is binary-management |
| 41 | **Control plane** | `packages/opencode/src/control-plane/` | `packages/n0face/src/control-plane/` | **Keep** — Cloud control plane integration |
| 42 | **Snapshot system** | `packages/opencode/src/snapshot/` | `packages/n0face/src/snapshot/` | **Keep** — State snapshots are generic |
| 43 | **ID generation** | `packages/opencode/src/id/` | `packages/n0face/src/id/` | **Keep** — ulid-based ID generation |
| 44 | **Question system** | `packages/opencode/src/question/` | `packages/n0face/src/question/` | **Keep** — User question/query flow |
| 45 | **Reference system** | `packages/opencode/src/reference/` | `packages/n0face/src/reference/` | **Keep** — Code reference/context |
| 46 | **Image processing** | `packages/opencode/src/image/` | `packages/n0face/src/image/` | **Keep** — Media handling |
| 47 | **ACP protocol** | `packages/opencode/src/acp/` | `packages/n0face/src/acp/` | **Keep** — Agent Communication Protocol |
| 48 | **Patch system** | `packages/opencode/src/patch/` | `packages/n0face/src/patch/` | **Keep** — Patch application |
| 49 | **Format system** | `packages/opencode/src/format/` | `packages/n0face/src/format/` | **Keep** — Output formatting |
| 50 | **Background jobs** | `packages/opencode/src/background/` | `packages/n0face/src/background/` | **Keep** — Background task runner |
| 51 | **Environment** | `packages/opencode/src/env/` | `packages/n0face/src/env/` | **Keep** — Env var management |
| 52 | **Worktree** | `packages/opencode/src/worktree/` | `packages/n0face/src/worktree/` | **Keep** — Git worktree |
| 53 | **CLI subcommands** | `packages/opencode/src/cli/cmd/*/` | `packages/n0face/src/cli/cmd/*/` | **Keep** — Command implementations are reusable |
| 54 | **n0face plan.md** | Root `n0face project plan.md` (empty) | `.am/plan.md` | **Create** — Migrate plan to `.am/` |

## 2. Systems That Can Stay Unchanged

These systems are mode-agnostic and require only package rename:

| System | Reason |
|--------|--------|
| Tool definitions (`src/tool/`) | Tools are generic; mode routing is a config concern |
| Session management (`src/session/`) | Session lifecycle is mode-agnostic |
| TUI rendering (`src/cli/cmd/tui/`) | Presentation layer, mode-independent |
| Plugin system (`src/plugin/` + `packages/plugin/`) | Plugin interface is extensible |
| MCP integration (`src/mcp/`) | Protocol, not mode |
| PTY subsystem (`src/pty/`) | Terminal emulation |
| Event bus (`src/bus/`) | Infrastructure |
| Storage engine (`src/storage/`) | Database is data-layer |
| Effect services (`src/effect/`) | Application wiring |
| V2 message model (`src/v2/`) | Data model |
| Shared UI components (`packages/ui/`) | Rendering primitives |
| Client SDK (`packages/sdk/`) | API client |
| HTTP recorder (`packages/http-recorder/`) | Testing infrastructure |
| HTTP server (`src/server/`) | API server |
| Auth system (`src/auth/`) | Authentication |
| Sync/Share systems (`src/sync/`, `src/share/`) | Data mobility |
| Git integration (`src/git/`) | VCS operations |
| LSP integration (`src/lsp/`) | Language services |
| Permission system (`src/permission/`) | Security model |
| LLM package (`packages/llm/`) | Provider abstraction |
| Binary launcher (`bin/n0face`) | Already branded as n0face |

## 3. Systems That Need Refactors

| System | Current Location | Planned Location | Refactor Required |
|--------|-----------------|------------------|-------------------|
| **Agent/mode definitions** | `.opencode/agent/*.md` | `.am/agent/*.md` | Move files and adapt to mode-based routing |
| **Command definitions** | `.opencode/command/*.md` | `.am/command/*.md` | Move files, add n0face-specific commands |
| **Mode system prompts** | `src/session/prompt/*.txt` | `.am/*.mode.md` | Migrate from provider-specific prompts to mode-specific prompts (cleanup, design, security) |
| **Main config** | `.opencode/opencode.jsonc` | `.am/n0face.jsonc` | Rename; update all config path references |
| **TUI config** | `.opencode/tui.json` | `.am/tui.json` | Move |
| **Skills** | `.opencode/skills/` | `.am/skills/` | Move and re-index |
| **Themes** | `.opencode/themes/` | `.am/themes/` | Move |
| **Custom tools** | `.opencode/tool/` | `.am/tool/` | Move |
| **Plugins** | `.opencode/plugins/` | `.am/plugins/` | Move |
| **Glossary/i18n** | `.opencode/glossary/` | `.am/glossary/` | Move |
| **State schema** | `src/storage/schema.sql.ts` | `.am/state/` | Extract schema definitions to `.am/state/` for portability |
| **Memory/prompt system** | `src/session/prompt.ts` (2135 lines) | `.am/agent/` + refactored prompt loader | Decouple static prompts from agent; move mode prompts out of code |
| **Config paths** | `src/config/paths.ts` | `.am/` paths | Update all path constants from `.opencode/` to `.am/` |
| **Config references** | All `process.env.OPENCODE_*` | `process.env.N0FACE_*` | Rename env vars (may be breaking) |

## 4. Systems That Should Be Deleted Entirely

| System | Current Location | Rationale |
|--------|-----------------|-----------|
| **Upstream CI workflows** | `.github/workflows/` (if unrelated to n0face) | Replace with n0face-specific CI |
| **sst infrastructure** | `infra/`, `sst.config.ts`, `sst-env.d.ts` | n0face will not use SST for deployment |
| **Enterprise web app** | `packages/enterprise/` | n0face has different enterprise model |
| **`packages/core/bin/opencode`** | Core binary entry | Branded as "opencode", not "n0face" |
| **Upstream .opencode content** | `.opencode/` (entire directory) | Replace with `.am/` |
| **Translated READMEs** | `README.*.md` (26 language files) | n0face has different messaging |
| **Unused GitHub agents** | `.opencode/agent/triage.md`, `duplicate-pr.md` | These are specific to upstream repo management |
| **Unused GitHub tools** | `.opencode/tool/github-triage.ts`, `github-pr-search.ts` | Specific to upstream GitHub workflows |
| **Upstream-specific commands** | `.opencode/command/changelog.md` | Changelog generation is upstream-specific |
| **n0face project plan.md** | Root placeholder file (empty) | Replace with proper plan in `.am/plan.md` |

## 5. Hybrid Systems (Keep + Extend)

| System | Keep | Extend/Add |
|--------|------|------------|
| **Agent runtime** (`src/agent/agent.ts`) | Agent lifecycle, subagent spawning, tool execution | Mode-aware agent selection (read mode from `.am/`) |
| **Prompt loading** (`src/session/prompt.ts`) | Prompt assembly, model-specific templating | Load mode prompts from `.am/*.mode.md` instead of hardcoded `*.txt` files |
| **Config system** (`src/config/config.ts`) | Layered config merge, remote config, variable substitution | Add mode-aware config keys; update default paths |
| **Plugin system** (`src/plugin/`) | Plugin loading, lifecycle, API | Mode-aware plugins |
| **Skill system** (`src/skill/`) | Skill discovery, skill execution | Mode-specific skills |
| **CLI entry** (`src/index.ts`) | Command routing, yargs parser | Add n0face-specific branding, rename binary references |
| **TUI** (`src/cli/cmd/tui/`) | Component library, routing, keybindings | Add mode indicator UI, update mascot to n0face branding |

## 6. Missing Systems (Need Creation)

| System | Description | Priority |
|--------|-------------|----------|
| **Mode router** | Select active mode (cleanup/design/security) at session start | High |
| **Mode-specific tool permissions** | Restrict available tools per mode | High |
| **Mode context loader** | Load `.am/*.mode.md` as system prompt | High |
| **n0face.jsonc** | Main config file replacing `opencode.jsonc` | High |
| **State directory** | `.am/state/` for session/memory persistence | Medium |
| **PROJECT_SUMMARY.md** | Auto-generated project summary (referenced by continue-project command) | Medium |
| **MODE_CONTEXT.md** | Auto-generated mode context file | Medium |
| **n0face CLI branding** | Update all CLI output, help text, version string to "n0face" | Medium |
| **n0face docs** | New documentation in `.am/` replacing opencode docs | Low |
| **n0face website** | Replace upstream marketing site with n0face landing page | Low |

## 7. Directory Rename Plan

```
Before:                              After:
packages/opencode/          →        packages/n0face/
packages/core/              →        packages/n0face-core/ (or merge into n0face)
.opencode/                  →        .am/ (already exists, merge contents)
```

Note: `packages/opencode/` already has `package.json` name `"n0face"`. The rename is directory-level only.
