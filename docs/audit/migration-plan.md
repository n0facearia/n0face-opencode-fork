# Migration Plan: opencode-ui → AM Architecture

Generated: 2026-05-25

## 1. Safe Migration Order

The migration should proceed in phases, each building on the previous. Phases are ordered to minimize breakage and allow incremental verification.

### Phase 0: Prerequisites (No Code Changes)
- [ ] Create `.am/state/` directory structure
- [ ] Create `.am/am.jsonc` (copy of `.opencode/opencode.jsonc`)
- [ ] Document all internal path references to `.opencode/` (use grep)
- [ ] Document all `process.env.OPENCODE_*` references (use grep)
- [ ] Take baseline test run to establish passing tests
  - **IMPORTANT**: Tests CANNOT be run from the repo root (there is a guard: `do-not-run-tests-from-root`).
  - Run tests from `packages/opencode` using `bun test`.
  - Typecheck using `bun typecheck` (do NOT use `tsc` directly).
  - See `AGENTS.md` for full test constraints.

### Phase 1: Config Path Migration (Low Risk)
- [ ] Update `src/config/paths.ts` to look for `.am/` first, fall back to `.opencode/`
- [ ] Update `Config.config.ts` to use `.am/am.jsonc` as primary config
- [ ] Add backward-compatible config loader (check `.opencode/`, then `.am/`)
- [ ] Update `ConfigMarkdown` to read from `.am/agent/`
- [ ] Run tests — should pass since both dirs exist

### Phase 2: Mode System Integration (Medium Risk)
- [ ] Create mode router: `src/mode/index.ts` (Effect Service)
  - Reads `.am/*.mode.md` files
  - Determines active mode from config/context
  - Exposes `Mode.active`, `Mode.prompt`, `Mode.commands`
- [ ] Create `ModeService` with:
  - `getActiveMode(): Effect<Mode>` — reads mode from config or context
  - `getModePrompt(mode): Effect<string>` — loads `.mode.md` as system prompt
  - `getModeCommands(mode): Effect<Command[]>` — loads mode-specific commands
- [ ] Update `src/session/prompt.ts` to load mode prompts instead of (or in addition to) hardcoded `*.txt` files
- [ ] Add `mode` field to session state
- [ ] Tests: Verify mode prompt loading, mode switching

### Phase 3: Agent Config Migration (Medium Risk)
- [ ] Move `.opencode/agent/*.md` → `.am/agent/` (filter: triage and duplicate-pr are upstream-specific; keep cleanup, design, security)
- [ ] Update agent config loader to read from `.am/agent/`
- [ ] Agent runtime (`agent.ts`) should select agent based on active mode
- [ ] `.am/agent/cleanup.md`, `design.md`, `security.md` already exist with proper frontmatter
- [ ] Remove upstream agents (triage, duplicate-pr) or move to examples
- [ ] Tests: agent selection by mode, agent config parsing

### Phase 4: Command Migration (Low Risk)
- [ ] Move `.opencode/command/` → `.am/command/`
- [ ] Filter commands: keep `learn`, `issues`, `translate`, `spellcheck`, `rmslop`, `ai-deps`
- [ ] Drop upstream-specific: `changelog`, `commit` (optional)
- [ ] `.am/command/continue-project.md`, `new-project.md` already exist
- [ ] Update command loader to read from `.am/command/`
- [ ] Tests: command loading from new path

### Phase 5: Skill & Tool Migration (Low Risk)
- [ ] Move `.opencode/skills/` → `.am/skills/`
- [ ] Move `.opencode/tool/` → `.am/tool/` (if tools are kept)
- [ ] Move `.opencode/plugins/` → `.am/plugins/`
- [ ] Move `.opencode/themes/` → `.am/themes/`
- [ ] Move `.opencode/glossary/` → `.am/glossary/`
- [ ] Update all loaders to read from `.am/` instead of `.opencode/`
- [ ] Tests: verify all resource types load from new paths

### Phase 6: Runtime Rebranding (Medium Risk)
- [ ] Update `packages/opencode/src/index.ts`:
  - Change `process.env.OPENCODE = "1"` → `process.env.AM = "1"` (already done)
  - Update help text, version output, CLI branding
- [ ] Update `process.env.AGENT` → `process.env.AM_AGENT`
- [ ] Update `process.env.OPENCODE_PID` → `process.env.AM_PID`
- [ ] Update `process.env.OPENCODE_PURE` → `process.env.AM_PURE`
- [ ] Update `process.env.OPENCODE_CLIENT` → `process.env.AM_CLIENT`
- [ ] Rename internal variables: `opencode` → `am` in logs, error messages
- [ ] Update `scriptName` in yargs from `"opencode"` to `"am"`
- [ ] Tests: verify output strings, env vars

### Phase 7: Mode-Aware Tool Permissions (High Risk)
- [ ] Add tool allowlist/blocklist to mode definitions
- [ ] Create `PermissionMode` service that restricts tools per mode
  - Security mode: allow audit tools, block write/edit tools
  - Design mode: allow UI-related tools
  - Cleanup mode: allow refactoring tools
- [ ] Update `ToolRegistry` to check mode permissions before execution
- [ ] Update `tool/filter.ts` (or equivalent) for mode-based filtering
- [ ] Tests: mode-appropriate tool blocking/allowance

### Phase 8: Prompt System Decoupling (High Risk)
- [ ] Extract mode prompts from `src/session/prompt/*.txt` to `.am/*.mode.md`
- [ ] Refactor `prompt.ts` (2135 lines) into:
  - `prompt/mode.ts` — Mode prompt loading
  - `prompt/assembly.ts` — Prompt assembly logic
  - `prompt/variables.ts` — Variable substitution
  - `prompt/format.ts` — Formatting
- [ ] Mode-specific prompts replace provider-specific prompts
- [ ] Provider-specific tweaks move to `.am/provider/` config
- [ ] Tests: prompt assembly equivalence, mode prompt override

### Phase 9: State/Memory System (Medium Risk)
- [ ] Create `.am/state/schema.sql.ts` — extracted state schema
- [ ] Create `.am/state/memory.ts` — memory persistence logic
- [ ] Update storage paths to use `.am/state/` for session data
- [ ] Implement state isolation per mode (optional)
- [ ] Tests: state read/write from new locations

### Phase 10: Package Rename (High Risk, Final)
- [ ] Rename `packages/opencode/` → `packages/n0face/`
- [ ] Update all workspace references in root `package.json`
- [ ] Update all inter-package imports
- [ ] Update `turbo.json` pipeline
- [ ] Update all CI workflows
- [ ] Update all Dockerfiles
- [ ] Full test suite run
- [ ] Full typecheck

## 2. Risky Files/Systems

| Risk Level | File/System | Risk | Mitigation |
|------------|-------------|------|------------|
| **CRITICAL** | `src/config/paths.ts` | Every config path in the system depends on this | Phase 1: dual-path (check both `.opencode/` and `.am/`) |
| **CRITICAL** | `src/session/prompt.ts` (2135 lines) | Monolithic, tightly coupled to provider-specific prompts | Phase 8: incremental extraction, don't rewrite in one shot |
| **CRITICAL** | `bin/n0face` bootstrap | Searches for `opencode-<platform>-<arch>` binary names | Must continue to resolve legacy binary names during transition |
| **HIGH** | `src/config/config.ts` (841 lines) | Core config merge, Effects, remote config, auth | Test each config path change independently |
| **HIGH** | `src/agent/agent.ts` | Agent lifecycle, subagent spawning, tool execution | Mode integration must not break existing agent behavior |
| **HIGH** | `src/effect/instance-state.ts` | ScopedCache-based instance management | Rename must not invalidate cache keys |
| **HIGH** | `src/storage/db.bun.ts` + `db.node.ts` | Platform-specific database clients | State path migration must not corrupt databases |
| **HIGH** | `src/tool/registry.ts` | Tool discovery and execution | Mode permission filtering must not break existing tool execution |
| **HIGH** | `packages/llm/` | External-facing package with many consumers | Package rename may break external dependents |
| **MEDIUM** | `process.env.OPENCODE_*` (20+ vars) | Scattered across codebase | Phase 6: add backward-compatible fallbacks (`OPENCODE_*` → `N0FACE_*`) |
| **MEDIUM** | `.opencode/` deletion | All upstream config lost | Keep `.opencode/` as fallback through Phase 1-5, delete only in Phase 10 |
| **MEDIUM** | `packages/ui/` theme paths | Theme files reference `.opencode/themes/` | Update theme loader path |
| **LOW** | `packages/desktop/` | Electron app with opencode branding | Separate rebranding effort |
| **LOW** | `packages/web/` + `packages/docs/` | Documentation sites | Content is not critical for runtime migration |

## 3. Potential Breaking Points

### 3.1 Backward Compatibility
- **Config path fallback**: Must support `.opencode/` configs for users who upgrade from upstream
- **Env var fallback**: `process.env.OPENCODE_*` must continue to work if `N0FACE_*` is not set
- **Binary names**: The platform binary resolver in `bin/n0face` must still find old `opencode-*` binaries
- **Database path**: SQLite database at `~/.config/opencode/opencode.db` must not be broken by migration
- **Plugin API**: `@opencode-ai/plugin` must maintain backward compatibility

### 3.2 Transition Period Config
During migration, the system must handle **both** `.opencode/` and `.am/` directories:
```typescript
// Pseudo-code for fallback strategy
function resolveConfigPath(name: string): string {
  // Check n0face first
  if (existsSync(join(".n0face", name))) return join(".n0face", name)
  // Fall back to opencode
  if (existsSync(join(".opencode", name))) return join(".opencode", name)
  // Default
  return join(".n0face", name)
}
```

### 3.3 Test Breakage Points
- Config path tests that hardcode `.opencode/`
- CLI output tests that check for "opencode" string
- Snapshot tests with "opencode" in paths
- Integration tests that depend on specific config file locations

### 3.4 Plugin System Breakage
- Plugins accessing `tui.json` at `.opencode/tui.json`
- Plugins reading config from `.opencode/opencode.jsonc`
- Plugin API referencing `@opencode-ai/plugin` package

## 4. Dependency Conflicts

| # | Dependency | Current Version | Issue |
|---|-----------|-----------------|-------|
| 1 | `effect` | 4.0.0-beta.65 | Beta version; API surface may change. Deep integration makes upgrade risky |
| 2 | `@opencode-ai/plugin` | 1.14.48 (workspace) | Self-referencing; must be renamed or aliased for n0face |
| 3 | `@opencode-ai/sdk` | 1.14.48 (workspace) | Self-referencing; must be renamed |
| 4 | `@opencode-ai/ui` | 1.14.48 (workspace) | Self-referencing; must be renamed |
| 5 | `@opencode-ai/core` | 1.14.48 (workspace) | Self-referencing; must be renamed |
| 6 | `@opencode-ai/llm` | 1.14.48 (workspace) | Self-referencing; must be renamed |
| 7 | `@opencode-ai/script` | 1.14.48 (workspace) | Self-referencing; must be renamed |
| 8 | `@opencode-ai/http-recorder` | 1.14.48 (workspace) | Self-referencing; must be renamed |
| 9 | `@opentui/core` | 0.2.8 (catalog) | TUI framework dependency; external package |
| 10 | `@opentui/solid` | 0.2.8 (catalog) | TUI framework dependency; external package |
| 11 | `@opentui/keymap` | 0.2.8 (catalog) | TUI framework dependency; external package |
| 12 | `drizzle-orm` | 1.0.0-beta | Beta database ORM |
| 13 | `ai` (Vercel AI SDK) | 6.0.168 | Major version 6; fast-moving API |
| 14 | `@pierre/diffs` | 1.1.0-beta | Diff library; external dependency |

### 4.1 Package Rename Strategy

Rather than renaming all `@opencode-ai/*` packages immediately, use npm aliases in root `package.json`:

```json
{
  "workspaces": {
    "packages": ["packages/*"],
    "aliases": {
      "@n0face/core": "@opencode-ai/core",
      "@n0face/llm": "@opencode-ai/llm",
      "@n0face/plugin": "@opencode-ai/plugin",
      "@n0face/ui": "@opencode-ai/ui",
      "@n0face/sdk": "@opencode-ai/sdk",
      "@n0face/script": "@opencode-ai/script"
    }
  }
}
```

This allows gradual migration of import paths without breaking everything at once.

## 5. Estimated Implementation Complexity

| Phase | Effort | Complexity | Parallelizable |
|-------|--------|------------|---------------|
| Phase 0: Prerequisites | 2 hours | Low | Yes |
| Phase 1: Config paths | 4 hours | Low | Yes |
| Phase 2: Mode system | 16 hours | Medium | No (new system) |
| Phase 3: Agent config | 4 hours | Low | With Phase 2 |
| Phase 4: Commands | 2 hours | Low | Yes |
| Phase 5: Skills/Tools/Themes | 4 hours | Low | Yes |
| Phase 6: Rebranding | 8 hours | Medium | No (many touchpoints) |
| Phase 7: Mode permissions | 12 hours | High | After Phase 2 |
| Phase 8: Prompt decoupling | 20 hours | High | After Phase 6 |
| Phase 9: State system | 8 hours | Medium | After Phase 1 |
| Phase 10: Package rename | 16 hours | High | Last |

**Total estimated effort**: ~96 hours (12 engineering days)

## 6. Recommended Refactor Strategy

### 6.1 Strategy: Incremental Migration with Dual-Path Support

1. **Never break the old path before the new path is proven**
2. **Add backward compatibility at each layer**
3. **Each phase produces a testable, releasable increment**

### 6.2 Key Architectural Decisions

#### Decision 1: Mode as First-Class Concept
The mode system should be a lightweight Effect service:
```typescript
// src/mode/mode.ts
export class Mode extends Context.Tag("n0face/Mode")<
  Mode,
  {
    readonly current: Effect<ModeType>
    readonly prompt: Effect<string>
    readonly commands: Effect<Command[]>
    readonly allowedTools: Effect<ToolFilter>
    readonly set: (mode: ModeType) => Effect<void>
  }
>() {}
```

#### Decision 2: Config Has Mode Awareness
```typescript
// .am/am.jsonc
{
  "mode": {
    "default": "cleanup",  // or "design", "security"
    "allow_switch": true,
    "prompts": {
      "cleanup": ".am/cleanup.mode.md",
      "design": ".am/design.mode.md",
      "security": ".am/security.mode.md"
    }
  }
}
```

#### Decision 3: Provider-Specific Prompts Become Mode Prompts
The current `src/session/prompt/*.txt` files (12 provider-specific prompts) merge into 3 mode prompts:
- Provider-specific behavior becomes config-driven (e.g., `providers.anthropic.prompt`)
- Mode prompts stay at `.am/*.mode.md`
- Provider optimization hints are expressed in `.am/provider/*.ts` config

#### Decision 4: Database Path Migration
The SQLite database moves from `~/.config/opencode/` to `~/.config/n0face/`:
- Create symlink `~/.config/opencode → ~/.config/n0face` (or vice versa)
- Update `Global.Path.data` in `@opencode-ai/core/global`
- Use environment variable override for dev

#### Decision 5: Env Var Migration
| Old Var | New Var | Fallback |
|---------|---------|----------|
| `OPENCODE` | `AM` | Always set both |
| `OPENCODE_PID` | `AM_PID` | Read `OPENCODE_PID` if `AM_PID` unset |
| `OPENCODE_PURE` | `AM_PURE` | Read `OPENCODE_PURE` if `AM_PURE` unset |
| `OPENCODE_CLIENT` | `AM_CLIENT` | Default if both unset |
| `OPENCODE_*` | `AM_*` | General fallback utility |

### 6.3 File-by-File Change Map

#### Phase 1 Files
```
packages/opencode/src/config/paths.ts   → Add .am/ as primary path
packages/opencode/src/config/config.ts  → Add fallback config loader
packages/opencode/src/config/markdown.ts → Update agent config path
```

#### Phase 2 Files (New + Modified)
```
NEW:  packages/opencode/src/mode/index.ts        (Mode service)
NEW:  packages/opencode/src/mode/mode.ts          (Mode types)
NEW:  packages/opencode/src/mode/loader.ts        (Mode prompt loader)
MOD:  packages/opencode/src/session/prompt.ts     (Mode-aware prompt loading)
MOD:  packages/opencode/src/session/session.ts    (Mode field)
MOD:  packages/opencode/src/session/schema.ts     (Mode schema)
```

#### Phase 6 Files
```
MOD:  packages/opencode/src/index.ts              (CLI branding)
MOD:  packages/opencode/src/cli/ui.ts             (UI output)
MOD:  packages/opencode/src/cli/logo.ts           (Logo/branding)
MOD:  packages/opencode/src/env/                  (Env var name changes)
MOD:  packages/opencode/src/installation/         (Install paths)
MOD:  packages/opencode/src/config/paths.ts       (Data directory)
```

#### Phase 10 Files
```
RENAME:  packages/opencode/ → packages/n0face/
MOD:     package.json                          (workspace references)
MOD:     turbo.json                            (pipeline)
MOD:     packages/*/package.json               (inter-package deps)
MOD:     .github/workflows/*                   (CI paths)
MOD:     packages/containers/*/Dockerfile      (build paths)
```

### 6.4 Testing Strategy

1. **Config path dual-read tests**: Verify same config loaded from `.opencode/` and `.am/`
2. **Mode loading tests**: Verify mode prompt content, mode switching
3. **Agent selection tests**: Verify correct agent loaded per mode
4. **Tool permission tests**: Verify tool filtering per mode
5. **Rebranding output tests**: Verify CLI output strings
6. **Backward compatibility tests**: Verify old paths still work
7. **Full integration test**: Run existing 240 tests after each phase

### 6.5 Rollback Plan

Each phase should be a reversible commit:
1. All migrations start with dual-path support
2. Old paths are deprecated but not deleted until Phase 10
3. Env var changes use fallback pattern (read old var if new var not set)
4. `.opencode/` directory is kept through Phase 5, deprecated in Phase 6, deleted in Phase 10
5. Binary name resolution falls back to `opencode-*` names if `n0face-*` not found

## 7. Immediate Next Steps

1. **Create `.am/state/` directory** (Phase 0)
2. **Add `.am/` path to `src/config/paths.ts`** (Phase 1, ~2 hours)
3. **Create `src/mode/` module** (Phase 2, ~4 hours)
4. **Move agent configs to `.am/agent/`** (Phase 3, ~2 hours)
5. **Update config loader for dual-path** (Phase 1, ~2 hours)
6. **Run all tests** — baseline must pass before Phase 2
