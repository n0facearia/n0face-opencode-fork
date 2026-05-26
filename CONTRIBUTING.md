# Contributing to n0face-opencode-fork

This guide covers how to extend the fork's mode system — adding new agent modes, importing skills, writing effective prompts, and testing changes.

---

## How to Add a New Mode

Each mode is a single Markdown file under `.n0face/agent/<name>.md`. It must contain all required sections in order. Use an existing mode file as a template.

### Step 1: Create the agent file

Create `.n0face/agent/<name>.md` with the frontmatter:

```yaml
---
mode: primary
hidden: false
color: "#HEXCODE"
description: One-sentence description of the mode's responsibility
---
```

### Step 2: Define the role (section 1)

One paragraph that states exactly what the mode does — and what it does NOT do. Be explicit about boundaries.

### Step 3: Define startup behavior (section 2)

List the files the mode reads at startup, in order:

1. Read `.n0face/project.md` for project state
2. Read `.n0face/state/<mode>.json` for previous session state
3. Do NOT proceed if required state files are missing
4. Never re-ask questions already answered in `project.md`

### Step 4: Define pre-work questions (section 3)

Ask questions that block further progress until answered. Format as numbered questions, one at a time. Adapt follow-ups based on previous answers. Do not proceed until each question has a clear answer.

### Step 5: Define outputs (section 4+)

Specify every file the mode creates or modifies. Each output must include:
- File name and location
- Contents/structure requirements
- Any format rules (e.g., ADR format, ASCII diagrams, canonical headers)

### Step 6: Define handoff logic

The mode must read `project.md` — check `Modes completed`, `Modes remaining`, `Known issues` — and output a conditional handoff suggestion. The last line of the handoff must be:

```
## HANDOFF — suggest <next_mode>
```

Documentation mode is the exception: it is terminal and does not hand off.

### Step 7: Add state file

Create `.n0face/state/<mode>.json` with an initial JSON object:

```json
{
  "touched_files": [],
  "decisions": [],
  "last_session": null
}
```

### Step 8: Add changelog rules

Include the canonical changelog format in the file:

```
## [YYYY-MM-DD HH:MM] — <mode> mode
- <action performed>
- <decision made and rationale>
- Files touched: <comma-separated>
- Suggested next: <mode> — <reason>
```

### Step 9: Add learning layer support

At the end of the file, add a conditional learning layer section:

```
## LEARNING LAYER
Check project.md for `learning_layer: enabled`. If disabled, skip.
If enabled, append to .n0face/learn/<mode>.md with format:
## Session: <timestamp>
### Action: <what was done>
**Why:** <rationale>
**What you should know:** <key context>
**If you want to go deeper:** <suggestions>
---
Self-prompt if 2+ minutes of response cycles have elapsed.
Do NOT create the learn/ directory — the mode only writes to it.
```

### Step 10: Test it

Follow the testing requirements below. Test on a real project, not a synthetic example.

---

## How to Add a New Skill

Skills are reusable reference files imported from upstream repos. They live under `.n0face/skills/<name>/`.

### Adding a skill

1. Clone or copy the skill content to `.n0face/skills/<name>/`
2. Create or update `.n0face/skills/SOURCES.md` with the origin URL and checksum
3. Reference the skill in a mode file using a relative path:

```
Read `.n0face/skills/<name>/SKILL.md` for reference patterns.
```

Do not embed skill content directly in mode files. Mode files reference skills by path; skills are loaded separately.

### Skill directory structure

```
.n0face/skills/
├── SOURCES.md             # Registry: origin URL + checksum per skill
├── <skill-name>/
│   ├── SKILL.md           # Entry point (loaded first)
│   └── ...                # Supporting files (templates, examples)
```

---

## Prompt Writing Rules

These rules apply to all `.n0face/agent/*.md` mode files. They ensure every mode is LLM-agnostic, testable, and maintainable.

### 1. LLM-agnostic

No model names (`Claude`, `GPT`, `Gemini`, `Llama`). No vendor-specific framing (`Anthropic`, `OpenAI`). No model-specific syntax (XML tags, chat templates, role markers like `<system>`/`<user>`/`<assistant>`). The same file must produce equivalent behavior on any supported LLM.

### 2. Single responsibility

One mode, one concern. If a mode would do two unrelated things, split it. Manager does not code. Documentation does not design. Cleanup does not deploy.

### 3. Read state first

Every mode must read `.n0face/project.md` and `.n0face/state/<mode>.json` before doing anything else. Block startup if required files are missing.

### 4. Block on ambiguity

Pre-work questions must block further progress until answered. Do not continue if a question returns a vague answer — ask a follow-up. Do not guess missing values.

### 5. Never re-ask

If a decision is recorded in `project.md`, use it. Only ask about what is unresolved. Check state JSON for previously answered questions.

### 6. Append-only logging

Changelog entries are never edited, only appended. Use the canonical format:

```
## [YYYY-MM-DD HH:MM] — <mode> mode
```

### 7. Canonical section formats

The following sections must appear verbatim in every mode file:
- **Changelog entry format** — fixed timestamp + action + decision + files + suggestion
- **Handoff format** — reads project.md, outputs `## HANDOFF — suggest <mode>`
- **Learning layer format** — conditional on `project.md`, uses `## Session:` / `### Action:` structure

### 8. Developer approval

No auto-apply behavior. Every code change, schema migration, deployment config, or destructive operation requires explicit developer confirmation before execution.

### 9. Handoff via project.md

Every mode (except documentation) must read `project.md` — check `Modes completed`, `Modes remaining`, `Known issues` — and output a conditional handoff suggestion based on what remains.

### 10. State persistence

Every mode must write its state JSON at the end of the session with `touched_files`, `decisions`, and `last_session` fields. The state file is the record of what the mode did, independent of the chat transcript.

---

## Testing Requirements

### Before submitting a new mode

1. **Test on a real project.** Create or use an existing project that exercises the mode's full workflow — pre-work questions, outputs, handoff, state persistence, and rerun behavior.
2. **Document the test.** Create `docs/<mode>-test-report.md` with:
   - Project used (name, size in files, tech stack)
   - What the mode was asked to do
   - What it produced (list of output files)
   - Any failures encountered and how they were fixed
   - Whether the handoff correctly identified the next mode
   - Whether rerunning the mode correctly skipped already-answered questions
3. **Test rerun behavior.** Run the mode twice on the same project. The second run must not re-ask questions answered in the first run (verified by state JSON).
4. **Verify LLM portability.** Search the mode file for any model-specific syntax or references. The file must not contain `Claude`, `GPT`, `Gemini`, `Llama`, `Anthropic`, `OpenAI`, `chatgpt`, or any XML tag patterns (`<context>`, `<instruction>`, etc.).
5. **Verify changelog format.** Run the mode and confirm its changelog entry follows the canonical format (timestamp + action + decision + files + suggestion).
6. **Verify handoff works.** Run the mode and confirm the handoff correctly reads `project.md` and suggests the appropriate next mode based on remaining modes.

### Before submitting changes to an existing mode

1. Run the mode on the same demo project used in the original test
2. Compare outputs — confirm intended behavior changed and unintended behavior did not
3. If the change adds new pre-work questions, verify they correctly check state JSON before asking

---

## Documentation Standards

Every mode file must contain all of the following sections in order:

1. **ROLE** — one-paragraph definition of the mode's responsibility
2. **STARTUP BEHAVIOR** — ordered list of files to read, conditions to check
3. **PRE-WORK QUESTIONS** — numbered blocking questions (if applicable)
4. **WORKFLOW** — step-by-step process for the mode's core task
5. **OUTPUTS** — specification of every file the mode creates
6. **CHANGELOG** — canonical entry format to use
7. **STATE** — what to read/write in `state/<mode>.json`
8. **LEARNING LAYER** — conditional section (must check `project.md` setting)
9. **HANDOFF** — read `project.md` and suggest next mode
10. **NEVER RE-ASK** — guardrail against repeating answered questions
11. **BOUNDARIES** — explicit list of what the mode does NOT do

Sections may be numbered (e.g., `## 1. ROLE`) or unnumbered, but the order must be consistent.

---

## Developing the Binary

See the upstream [OpenCode contributing guide](https://github.com/sst/opencode/blob/dev/CONTRIBUTING.md) for instructions on building, debugging, and submitting PRs to the TUI/CLI binary. This repo's binary changes (mascot, tabbed views, home screen) follow the same development workflow.
