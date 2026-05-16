<p align="center">
  <picture>
    <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
    <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="OpenCode logo" width="480">
  </picture>
</p>
<p align="center"><strong>n0face's OpenCode Fork</strong> — AI coding agent with custom modes, mascot, and project tools.</p>

---

## One-Command Install

Run this in any project directory:

```bash
curl -fsSL https://raw.githubusercontent.com/n0facearia/n0face-opencode-fork/main/install.sh | bash
```

Installs 3 custom agent modes (design, cleanup, security), system prompts, and configs — then press **Tab** to cycle through all 5 modes.

---

## What's Different From OpenCode

| Feature | OpenCode | This Fork |
|---------|----------|-----------|
| **Agent modes** | plan, build | plan, build, **design, cleanup, security** |
| **TUI Mascot** | None | Animated cat sprites |
| **Message tabs** | None | Result / Thinking toggle |
| **Home screen** | Single column | Three-column layout |
| **Mode prompts** | 2 built-in | 5 modes with system prompts |
| **Setup commands** | None | `/new-project`, `/import-md` |
| **Install** | `curl opencode.ai/install` | `curl raw.githubusercontent.com/...` |

### Custom Agents

| Agent | Color | Purpose |
|-------|-------|---------|
| **design** | Purple `#A855F7` | UI/UX audit, accessibility, animations |
| **cleanup** | Green `#22C55E` | Code quality, dead code, performance |
| **security** | Red `#EF4444` | Vulnerability scan, dependency audit |

---

## Quick Start

### Install the mode system (in any project)

```bash
curl -fsSL https://raw.githubusercontent.com/n0facearia/n0face-opencode-fork/main/install.sh | bash
```

### Run n0face

```bash
n0face
```

### Switch modes

Press **Tab** to cycle: `plan` → `build` → `design` → `cleanup` → `security`

### Create a new project

```
/new-project
```

### Import into existing project

```
/import-md
```

---

## Manual Install (Full Fork)

For the TUI customizations too (mascot, tabbed views, home screen):

```bash
git clone https://github.com/n0facearia/n0face-opencode-fork.git
cd n0face-opencode-fork/packages/opencode
npm i -g bun
bun install
bun run build
```

Then `n0face` is available anywhere.

---

## The Mascot

The cat sprite changes based on the agent's state:

| State | Eyes | What's happening |
|-------|------|------------------|
| **idle** | `~ _ ~` | Waiting for your input |
| **thinking** | `^ _ ^` | Model is streaming or executing tools |
| **planning** | `███` | Plan mode is active |

---

## File Structure

```
.n0face/                        # Mode system prompts
├── design.mode.md              # Design audit checklist and workflow
├── cleanup.mode.md             # Code quality audit checklist and workflow
└── security.mode.md            # Security audit checklist and workflow

.opencode/agent/                # Agent configurations
├── design.md                   # Design agent (mode: primary)
├── cleanup.md                  # Cleanup agent (mode: primary)
└── security.md                 # Security agent (mode: primary)

.opencode/command/              # Custom slash commands
├── new-project.md              # /new-project — scaffold a new project
└── import-md.md                # /import-md — import into existing project

TUTORIAL.md                     # Full guide with mode commands and references
install.sh                      # One-command install script
```

---

## Credits

This is a feature fork of [OpenCode](https://github.com/sst/opencode) — the open source AI coding agent by [SST](https://sst.dev).

---

<p align="center">
  <a href="TUTORIAL.md">Full Tutorial →</a>
</p>
