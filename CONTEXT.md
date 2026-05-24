# opencode-ui — n0face fork

## Custom features added

### Mascot feature — cat sprites in session header

**Files:**
- `packages/opencode/src/cli/logo.ts` — added `catIdle`, `catThink`, `catPlan` exports (box-drawing cat face, 11×4)
- `packages/opencode/src/cli/cmd/tui/component/mascot.tsx` — `Mascot` component, delegates to `<Logo>` with shape based on `MascotMode`
- `packages/opencode/src/cli/cmd/tui/routes/session/index.tsx` — mascot header bar with `mascotMode` signal (idle/thinking/planning)

**Mascot modes:**
- `idle`: `┌─────────┐` / `│ █  █    │` / `│ ───────  │` / `└─────────┘`
- `thinking`: `│ ~~~~~~~  │` middle row
- `planning`: `│ ∿∿∿∿∿∿∿  │` middle row

**Mode logic** (`mascotMode` signal):
- `pending()` → `"thinking"` (AI streaming response)
- `local.agent.current()?.name === "plan"` → `"planning"`
- otherwise → `"idle"`

### Tabbed Thinking / Result view

**File:** `packages/opencode/src/cli/cmd/tui/routes/session/index.tsx`

Two tabs in the mascot header bar:
- **Result** — shows all parts except `reasoning` type
- **Thinking** — shows only `reasoning` parts across all messages

**State:** `activeTab` signal (`"result"` | `"thinking"`, defaults to `"result"`), exposed via session context. Not persisted.

**Filtering:** `visibleParts` memo in `AssistantMessage` component filters based on `ctx.activeTab()`.

**Empty state:** "No thinking content yet." shown when Thinking tab is active but no reasoning content exists.

**Existing `showThinking` toggle** preserved for export/transcript control.

### Home screen layout

**File:** `packages/opencode/src/cli/cmd/tui/routes/home.tsx`

Three-column layout:
- Left: `<Mascot mode="idle" />` (12 cols)
- Center: "Welcome back !"
- Right: info panel with `n0face v0.1.0`, `opencode server`, `Model:`, `Session:`

### Auto-update checker — cross-repo version notifications

**Files:**
- `packages/app/src/utils/check-update.ts` — GitHub API utility that fetches latest releases from both `anomalyco/opencode` and `n0facearia/n0face-opencode-fork`, picks the higher semver
- `packages/app/src/entry.tsx` — Added `checkUpdate`/`updateAndRestart` to web platform, enabling the existing toast notification system
- `packages/app/src/index.ts` — Exported `checkUpdate` for reuse
- `packages/desktop/src/renderer/index.tsx` — Falls back to GitHub API check when Electron updater is disabled (dev mode)
- `packages/opencode/src/installation/index.ts` — `Installation.latest()` now fetches both repos in parallel and returns the higher version (was single repo based on `N0FACE`)
- `packages/opencode/src/cli/upgrade.ts` — TUI startup check (1s after launch) flows through this

**Behavior:**
- **Web app**: Polls GitHub releases on startup and every 10 minutes via the existing `useUpdatePolling` in `layout.tsx`; shows "Update available" toast with version
- **Desktop app**: Uses `electron-updater` when packaged; falls back to GitHub API in dev
- **TUI/CLI**: Checks 1s after startup via RPC, shows dialog with OK/Skip

## Misc

- AGENTS.md at repo root documents these features for AI agents
- Upstream base: https://github.com/sst/opencode
- Fork remote: `my-fork` → https://github.com/n0facearia/my-opencode-setup
