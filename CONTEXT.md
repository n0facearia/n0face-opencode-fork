# opencode-ui — AM fork

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
- Right: info panel with `AM v0.1.0`, `opencode server`, `Model:`, `Session:`

## Misc

- AGENTS.md at repo root documents these features for AI agents
- Upstream base: https://github.com/sst/opencode
- Fork remote: `my-fork` → https://github.com/n0facearia/my-opencode-setup
