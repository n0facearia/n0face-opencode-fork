# am-opencode-fork — Full Project Plan

> **Purpose of this document:** This is the single source of truth for the am-opencode-fork project. It can be shared with any LLM to give it full context of the project vision, architecture, rules, and step-by-step build plan without needing prior conversation history.

---

## 1. Project Vision

**am-opencode-fork** is a developer-grade, terminal-based AI coding assistant built on top of [OpenCode](https://github.com/sst/opencode). It is not a replacement for existing AI tools — it is a **compositor**: it brings together the best open-source skill systems, linters, analyzers, and agent patterns into a single cohesive experience, so a developer can take a project from idea to clean, production-ready code entirely within their terminal.

### Core Philosophy

- **No assumptions, ever.** The agent asks every question it needs before touching code. A project built fast but debugged for weeks is a failure.
- **Clean over clever.** Every file, function, and decision must be readable by a human who wasn't part of the conversation.
- **The developer is in control.** The agent suggests, explains, and recommends — but the developer always makes the final call.
- **LLM-agnostic.** The fork works with any LLM the developer configures in OpenCode (Claude, GPT-4o, Gemini, local models via Ollama, etc.). The modes are powered by `.md` skill files, not by any single model's capabilities.
- **Learning is optional, not mandatory.** Developers who want to understand what the agent did can enable the learning layer. Those who just want results can keep it off.
- **Workers in a company.** Each mode is a specialist. They hand off to each other, share project state, and never duplicate work.

### Target User

A developer who already knows how to code and wants a smarter, faster, cleaner workflow — not a beginner who needs hand-holding on what a variable is.

---

## 2. Repository Structure

```
.am/
├── project.md                  # Shared project state — all modes read and write this
├── changelog.md                # Auto-maintained log of every agent action across sessions
├── learn/                      # Optional learning layer output (only exists if enabled)
│   ├── design.md
│   ├── backend.md
│   ├── frontend.md
│   ├── cleanup.md
│   ├── security.md
│   ├── database.md
│   ├── testing.md
│   ├── devops.md
│   └── documentation.md
├── agent/                      # Mode system prompt files (the "workers")
│   ├── manager.md              # Project Manager mode — orchestrates the others
│   ├── design.md
│   ├── frontend.md
│   ├── backend.md
│   ├── database.md
│   ├── cleanup.md
│   ├── security.md
│   ├── testing.md
│   ├── devops.md
│   └── documentation.md
├── skills/                     # Pulled from open-source skill repositories
│   ├── open-design/            # From nexu-io/open-design
│   ├── agent-skills/           # From addyosmani/agent-skills
│   └── wshobson-agents/        # From wshobson/agents
└── state/                      # Per-mode state files
    ├── design.json
    ├── frontend.json
    ├── backend.json
    ├── database.json
    ├── cleanup.json
    ├── security.json
    ├── testing.json
    ├── devops.json
    └── documentation.json
```

---

## 3. The Mode System

Each mode is a "worker" with a defined role, a set of open-source skills it uses, tools it can call, and a clear handoff protocol. All modes:

1. Read `.am/project.md` at the start of every session.
2. Write their decisions and outputs back to `.am/project.md` and their own `.am/state/<mode>.json`.
3. Append a summary of what they did to `.am/changelog.md`.
4. End every session by suggesting the next logical mode (semi-auto collaboration).
5. If the learning layer is enabled, append to `.am/learn/<mode>.md` and auto-update it every 2 minutes during an active session AND after every agent response.

---

### 3.1 — Project Manager Mode (`manager`)

**Role:** The entry point for every new project. Runs the deep intake questionnaire, writes the initial `project.md`, and orchestrates which modes should run and in what order. if used in an existing project, it will scan the project and make the `project.md` file and if there are any remaining questions it will ask those questions.

**Intake questionnaire (15–20 questions, nothing assumed):**

1. What is the name of this project?
2. In one sentence, what does it do and who is it for?
3. Is this a new project or are we continuing an existing one?
4. What type of project is this? (web app / API / CLI tool / library / mobile / desktop / other)
5. What is the primary language? (TypeScript / JavaScript / Python / Go / Rust / other)
6. What frontend framework, if any? (Next.js / React / Vue / SvelteKit / none / I want a suggestion)
7. What backend framework, if any? (Hono / Fastify / Express / Hono / none / I want a suggestion)
8. What database, if any? (PostgreSQL / SQLite / MongoDB / none / I want a suggestion)
9. Does this project need authentication? (yes / no / not sure)
10. Does this project need real-time features? (WebSockets, SSE, etc.)
11. Does this project need file uploads or media handling?
12. Will this be deployed? If yes, where? (Vercel / Fly.io / Railway / VPS / Docker / not decided)
13. What is the expected scale? (personal tool / small team / public-facing product)
14. Are there any third-party APIs or services this must integrate with?
15. What is your definition of "done" for this project?
16. Are there any hard constraints? (must use X library, must avoid Y, must work offline, etc.)
17. Do you want the learning layer enabled? (generates and auto-updates `.am/learn/` files)
18. What coding style rules do you want enforced? (tabs/spaces, quote style, max line length, etc.)
19. Do you want inline code comments explaining what each part does?
20. Any other context the agent should know before starting?

After intake, the manager writes `project.md` and proposes a **build order** — which modes to run first, second, third, etc. — based on the answers. The developer confirms or adjusts the order before anything else happens.

---

### 3.2 — Design Mode (`design`)

**Role:** Defines the visual identity, design system, and component structure of the project before any code is written.

**Open-source skills used:**

- [nexu-io/open-design](https://github.com/nexu-io/open-design) — 31 composable skills and 72 brand-grade design systems. The relevant `SKILL.md` and `DESIGN.md` files are pulled into `.am/skills/open-design/` and injected into the agent's context automatically.
- Specifically: `web-prototype`, `saas-landing`, `dashboard`, and `component-library` skills from open-design.

**What this mode asks before touching anything:**

- What style/vibe? (minimal, bold, corporate, playful — or describe it)
- Dark mode, light mode, or both?
- Which design system to use? (open-design provides 72 options — agent presents top 5 based on project type)
- Component library preference? (shadcn/ui, Radix, DaisyUI, Tailwind-only, or suggestion)
- Any brand colors or fonts already decided?

**What this mode produces:**

- A `design-system.md` in the project root documenting: color tokens, typography scale, spacing system, component naming conventions
- A `components/` scaffold with empty but correctly named component files
- A brief explanation of every design decision and why it fits the project

**Handoff suggestion:** → Frontend mode

---

### 3.3 — Frontend Mode (`frontend`)

**Role:** Builds the actual UI based on the design system the design mode defined. Never invents design decisions — only implements what's in `design-system.md`.

**Open-source skills used:**

- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) — specifically: `incremental-implementation`, `test-driven-development`, `documentation-and-adrs`
- open-design component skills for reference

**Stack (suggested, easily changeable):**

- Next.js 14+ (App Router)
- Tailwind CSS
- shadcn/ui or DaisyUI (based on design mode decision)
- TypeScript strict mode

**What this mode produces:**

- Complete page and component implementations following the design system exactly
- Every component file has a comment block at the top explaining: what it does, what props it accepts, what it renders, and any gotchas
- A `FRONTEND.md` in the project root with the component tree and routing structure

**Handoff suggestion:** → Backend mode or Database mode (whichever comes first)

---

### 3.4 — Backend Mode (`backend`)

**Role:** Designs and builds the server layer — APIs, business logic, middleware, and service architecture.

**Open-source skills used:**

- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) — `spec-driven-development`, `api-and-interface-design`, `incremental-implementation`, `documentation-and-adrs`
- [wshobson/agents](https://github.com/wshobson/agents) — `backend-architect` agent principles: contract-first API design, domain-driven service boundaries, resilience patterns (circuit breakers, retries), observability as a first-class concern

**Stack (suggested, easily changeable based on project language):**

- TypeScript/Bun projects → Hono + Zod
- Node.js projects → Fastify + Zod
- Python projects → FastAPI + Pydantic

**What this mode asks before touching anything:**

- REST, GraphQL, or tRPC?
- Will this need background jobs or queues?
- What auth strategy? (JWT, sessions, OAuth, API keys)
- Will any endpoints need rate limiting?

**What this mode produces:**

- API contract document (`API.md`) written before any code — endpoints, request/response shapes, status codes, error formats
- Route files with inline comments explaining every handler: what it does, what it expects, what it returns, and what can go wrong
- A `BACKEND.md` with the service architecture diagram in ASCII and all architectural decisions documented as ADRs (Architecture Decision Records)

**Handoff suggestion:** → Database mode or Security mode

---

### 3.5 — Database Mode (`database`)

**Role:** Designs the data model, writes migrations, and sets up the ORM layer cleanly.

**Open-source skills used:**

- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) — `spec-driven-development`, `documentation-and-adrs`
- [wshobson/agents](https://github.com/wshobson/agents) — database design patterns

**Stack (suggested):**

- PostgreSQL → Drizzle ORM (TypeScript) or Prisma
- SQLite → Drizzle ORM
- MongoDB → Mongoose (only if explicitly chosen)

**What this mode asks before touching anything:**

- What entities does the system have? (walk through each one)
- What are the relationships between them?
- What queries will be most frequent? (for indexing decisions)
- Does any data need soft-delete or audit trails?

**What this mode produces:**

- Schema file with every column commented explaining its purpose and constraints
- Migration files named with timestamps and description (e.g. `0001_create_users_table.sql`)
- A `DATABASE.md` with an entity-relationship diagram in ASCII and all indexing decisions explained

**Handoff suggestion:** → Backend mode (if not already done) or Testing mode

---

### 3.6 — Cleanup Mode (`cleanup`)

**Role:** Finds and fixes dead code, unused dependencies, formatting inconsistencies, and code smells. Acts as the project's housekeeper.

**Open-source tools used (called as shell commands, output parsed and explained):**

- [oxlint](https://oxc.rs/docs/guide/usage/linter) — Rust-based linter, extremely fast. Already in the fork's config (`.oxlintrc.json`). Run as: `oxlint --format json`
- [knip](https://github.com/webpkg/knip) — Finds unused files, exports, and dependencies. Run as: `knip --reporter json`

**What this mode does:**

1. Runs `oxlint` → parses JSON output → presents findings grouped by severity with plain-English explanation of each issue
2. Runs `knip` → parses JSON output → presents unused exports/files/deps with explanation of why they're unused and whether it's safe to remove
3. Proposes fixes (with diffs) and waits for developer confirmation before changing anything
4. Never auto-deletes anything — always shows what would be removed and asks first

**Handoff suggestion:** → Security mode

---

### 3.7 — Security Mode (`security`)

**Role:** Scans the codebase for security vulnerabilities, insecure patterns, and dependency issues. Acts as the project's security reviewer.

**Open-source tools used:**

- [semgrep](https://github.com/returntocorp/semgrep) — Static analysis with thousands of community rules for JS/TS/Python. Run as: `semgrep --config auto --json`
- `npm audit --json` — Dependency vulnerability scanning (free, built into npm)

**What this mode does:**

1. Runs `semgrep` → parses JSON → presents findings with: severity level, what the vulnerability is, why it's dangerous, and how to fix it
2. Runs `npm audit` → parses output → presents vulnerable dependencies with CVSS scores and recommended versions
3. Proposes fixes with diffs — never auto-applies anything
4. Adds a `SECURITY.md` to the project root with a summary of the security posture and any known accepted risks

**Handoff suggestion:** → Testing mode or DevOps mode

---

### 3.8 — Testing Mode (`testing`)

**Role:** Writes tests for existing code. Never writes code without tests — always pairs implementation with verification.

**Open-source skills used:**

- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) — `test-driven-development`, `verify-and-validate`

**Stack (suggested):**

- TypeScript/Bun → Vitest + Testing Library (for UI) + Supertest (for APIs)
- Python → pytest

**What this mode produces:**

- Unit tests for every utility function
- Integration tests for every API endpoint
- Component tests for every UI component that has user interaction
- A `TESTING.md` explaining the test strategy, coverage targets, and how to run the test suite

**Handoff suggestion:** → DevOps mode or Documentation mode

---

### 3.9 — DevOps Mode (`devops`)

**Role:** Sets up CI/CD pipelines, Docker configuration, deployment scripts, and environment management.

**Open-source skills used:**

- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) — `ship-and-deploy`, `documentation-and-adrs`
- [wshobson/agents](https://github.com/wshobson/agents) — devops-engineer agent principles

**What this mode asks before touching anything:**

- What is the deployment target? (Vercel / Fly.io / Railway / Docker on VPS / GitHub Actions + other)
- Do you need staging environments or just production?
- What secrets/environment variables does the project need?
- Do you have a Template in mind for docker file and docker compose?

**What this mode produces:**

- GitHub Actions workflow files (CI: lint + test + build on every PR; CD: deploy on merge to main)
- `Dockerfile` and `.dockerignore` if needed
- `.env.example` with every environment variable documented (what it does, where to get it, example value)
- A `DEVOPS.md` explaining the deployment architecture and runbook for common operations

**Handoff suggestion:** → Documentation mode (final mode)

---

### 3.10 — Documentation Mode (`documentation`)

**Role:** The final worker. Synthesizes everything produced by every other mode into clean, human-readable documentation.

**Open-source skills used:**

- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) — `documentation-and-adrs`

**What this mode produces:**

- A polished `README.md` with: project description, features, tech stack, prerequisites, installation steps, environment setup, running locally, running tests, deployment, and contributing guide
- Updates all existing mode-produced docs (`BACKEND.md`, `FRONTEND.md`, etc.) for consistency
- A `ARCHITECTURE.md` with a high-level system diagram in ASCII and plain-English explanation of how all the pieces connect

**This mode never handoffs** — it is the end of the pipeline.

---

## 4. Shared Project State

### `.am/project.md`

This file is the brain of the project. Every mode reads it at startup and writes to it when making decisions. It contains:

```markdown
# Project: <name>

## Overview
<one-paragraph description>

## Stack
- Language: 
- Frontend: 
- Backend: 
- Database: 
- Deployment: 

## Decisions Made
<chronological list of architectural decisions with rationale>

## Current State
- Modes completed: []
- Modes in progress: []
- Modes remaining: []
- Last active mode: 
- Last session: <timestamp>

## Known Issues / Open Questions
<anything unresolved that a future mode needs to handle>
```

### `.am/state/<mode>.json`

Each mode's own memory. Contains mode-specific state like: which files it has touched, what it found, what it proposed, what the developer accepted/rejected.

### `.am/changelog.md`

Auto-maintained by every mode. Append-only. Format:

```markdown
## [2025-01-15 14:32] — backend mode
- Wrote API contract for /auth/login and /auth/logout
- Created src/routes/auth.ts with 3 handlers
- Added JWT middleware to src/middleware/auth.ts
- ADR-001: Chose Hono over Fastify because project is Bun-based
- Suggested next: database mode
```

---

## 5. The Learning Layer

### When enabled (set during intake):

After every agent response, and on a 2-minute timer (it checks if there has been any changes in the project since the last update) during an active session, the agent appends to `.am/learn/<mode>.md`. The file is structured as:

```markdown
# What the [mode] mode did — and why

## Session: <timestamp>

### Action: <what was done>
**Why:** <explanation in plain developer language>
**What you should know:** <the concept or pattern behind this decision>
**If you want to go deeper:** <links to docs, articles, or the open-source project used>

---
```

The file is cumulative — it grows throughout the project and becomes a learning log the developer can read to understand the patterns used in their own codebase.

### When disabled:

None of the `.am/learn/` files are created. The modes work exactly the same but without the educational append.

---

## 6. Code Quality Rules (Applied by All Modes)

Every file produced by any mode must follow these rules:

1. **Every file has a header comment** explaining: what this file is, what it's responsible for, and what it is NOT responsible for (boundaries matter).
2. **Every function has a JSDoc/docstring** with: what it does, parameters, return value, and any side effects.
3. **Every non-obvious line has an inline comment.** If someone reading the code for the first time would pause and think "why?", that line needs a comment.
4. **No magic numbers or strings.** All constants are named and placed in a `constants/` or `config/` file.
5. **No `any` in TypeScript.** Strict mode is always on.
6. **Error handling is never an afterthought.** Every async operation has proper error handling. Every error produces a useful message, not just a rethrow.
7. **File and folder names are consistent.** Agreed at intake and never deviated from.

---

## 7. Open-Source Dependencies (The Skill Stack)

|Mode|Open-Source Project|What is pulled|
|---|---|---|
|Design|[nexu-io/open-design](https://github.com/nexu-io/open-design)|`skills/` and `design-systems/` SKILL.md + DESIGN.md files|
|Frontend|[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)|`incremental-implementation`, `test-driven-development`, `documentation-and-adrs`|
|Backend|[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) + [wshobson/agents](https://github.com/wshobson/agents)|`spec-driven-development`, `api-and-interface-design`, `backend-architect` patterns|
|Database|[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) + [wshobson/agents](https://github.com/wshobson/agents)|`spec-driven-development`, database design agent|
|Cleanup|[oxlint](https://oxc.rs) + [knip](https://github.com/webpkg/knip)|CLI tools called as shell commands|
|Security|[semgrep](https://github.com/returntocorp/semgrep)|CLI tool called as shell command|
|Testing|[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)|`test-driven-development`, `verify-and-validate`|
|DevOps|[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) + [wshobson/agents](https://github.com/wshobson/agents)|`ship-and-deploy`, devops-engineer agent|
|Documentation|[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)|`documentation-and-adrs`|

---

## 8. LLM Agnosticism

The fork works with any LLM the developer configures in OpenCode. The `.md` skill files and mode prompts are written in plain language with no model-specific syntax. The LLM is a pluggable engine — the intelligence of the fork comes from the skill system and the structured prompts, not from locking in one provider.

At no point should any mode prompt or skill file reference a specific LLM, use prompt injection patterns specific to one model, or assume any capability beyond text generation and tool calling.

---

## 9. Terminal Compatibility

The fork runs equally well in:

- VS Code integrated terminal
- Any standalone terminal (iTerm2, Windows Terminal, kitty, etc.)

No VS Code extension APIs are used. No GUI features are assumed. All output is plain terminal text with ANSI color codes that degrade gracefully if not supported.

---

## 10. Step-by-Step Build Plan

This is the sequence in which to build the fork. Each step is independently completable and testable before moving to the next.

### Phase 1 — Foundation

**Step 1.1 — Audit the existing fork**

- Review all current files in the fork
- Document what already exists and what needs to be changed
- Map the current mode files to the new planned structure

**Step 1.2 — Set up the `.am/` directory structure**

- Create all folders: `agent/`, `skills/`, `state/`, `learn/`
- Create the `project.md` template
- Create the `changelog.md` with a header
- No logic yet — just the structure

**Step 1.3 — Pull open-source skills**

- Clone/copy the relevant SKILL.md files from open-design into `.am/skills/open-design/`
- Clone/copy the relevant skill files from addyosmani/agent-skills into `.am/skills/agent-skills/`
- Clone/copy the relevant agent files from wshobson/agents into `.am/skills/wshobson-agents/`
- No modification — keep them as upstream files so they can be updated

**Step 1.4 — Write the Project Manager mode**

- Write `.am/agent/manager.md` with the full 20-question intake questionnaire
- Write the logic for generating the build order
- Write the logic for creating `project.md` from intake answers
- Test it: start a fresh project and run the full intake

### Phase 2 — Core Modes

**Step 2.1 — Write the Backend mode**

- Write `.am/agent/backend.md` integrating agent-skills and wshobson patterns
- Test: create a simple REST API from scratch using only this mode

**Step 2.2 — Write the Design mode**

- Write `.am/agent/design.md` integrating open-design skills
- Test: generate a design system for a sample SaaS project

**Step 2.3 — Write the Frontend mode**

- Write `.am/agent/frontend.md`
- Test: implement a design-system-based component using only this mode

**Step 2.4 — Write the Database mode**

- Write `.am/agent/database.md`
- Test: design a schema for a simple app with users and posts

### Phase 3 — Quality Modes 

**Step 3.1 — Write the Cleanup mode + integrate oxlint and knip**

- Write `.am/agent/cleanup.md`
- Write the shell-call + JSON-parse logic for oxlint and knip
- Test: run on an intentionally messy codebase

**Step 3.2 — Write the Security mode + integrate semgrep and npm audit**

- Write `.am/agent/security.md`
- Write the shell-call + JSON-parse logic for semgrep and npm audit
- Test: run on a codebase with known vulnerabilities

**Step 3.3 — Write the Testing mode**

- Write `.am/agent/testing.md`
- Test: write tests for a sample backend route file

### Phase 4 — Infrastructure Modes

**Step 4.1 — Write the DevOps mode**

- Write `.am/agent/devops.md`
- Test: generate a complete GitHub Actions CI/CD setup for a Next.js + Hono project

**Step 4.2 — Write the Documentation mode**

- Write `.am/agent/documentation.md`
- Test: generate a complete README from scratch using project state

### Phase 5 — Cross-Mode Systems

**Step 5.1 — Implement shared state (project.md read/write)**

- Every mode reads `project.md` on start
- Every mode writes its decisions back to `project.md`
- Test: run backend mode, then security mode, verify security mode sees backend's decisions

**Step 5.2 — Implement changelog.md auto-append**

- Every mode appends a structured entry to `changelog.md` at the end of each session
- Test: run 3 modes in sequence, verify changelog reads like a coherent project history

**Step 5.3 — Implement semi-auto mode handoff**

- Every mode ends with a "Suggested next step: [mode name] — because [reason]"
- The suggestion is based on what was just completed and what `project.md` says is remaining
- Test: run a full project from manager → design → frontend → backend and verify handoffs are logical

**Step 5.4 — Implement the learning layer**

- Add learning-layer append logic to every mode
- Implement the 2-minute auto-update timer
- Implement the post-response trigger
- Test: enable learning, run backend mode, verify `.am/learn/backend.md` updates in real-time

### Phase 6 — Polish and Integration Testing

**Step 6.1 — End-to-end integration test**

- Start a real project from scratch (suggest: a simple task management API with a frontend)
- Run every mode in order
- Document every failure and fix it

**Step 6.2 — Cross-LLM testing**

- Test the full mode system with at least 2 different LLMs
- Identify any mode prompts that are too model-specific and rewrite them to be neutral

**Step 6.3 — Documentation**

- Write the fork's own README explaining how to install, configure, and use it
- Write a `CONTRIBUTING.md` so other developers can add modes or skills

---

## 11. Rules Every Future AI Must Follow When Working on This Project

1. **Read `project.md` before doing anything.** Never assume context.
2. **Never modify files outside the scope of the active mode.** If you are in backend mode, you do not touch frontend files.
3. **Never auto-apply changes without showing a diff first.** The developer confirms, always.
4. **Every file you create must follow the code quality rules in Section 6.**
5. **Every decision must be written to `project.md` and `changelog.md`.**
6. **If you are unsure about anything, ask.** A precise question is better than a wrong assumption.
7. **Suggest the next mode at the end of every session.** Explain why.
8. **If the learning layer is enabled, append to the correct `.am/learn/<mode>.md` file.**
9. **Never lock in a specific LLM. Never use model-specific syntax in skill files.**
10. **The developer is the final decision-maker. You are a very good specialist contractor, not the project owner.**

---

_Document version: 1.0 — Created as the foundational planning document for am-opencode-fork._