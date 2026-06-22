# Anchored Summary

## Goal
Analyze the "Continue/Feedback Choice stopped appearing" bug at the end of a mode's work — find root cause and determine fix.

## Key Findings

### The rule IS centralized — not duplicated per mode file
The previous session's theory was wrong. The Continue/Feedback choice is ALREADY implemented once in a centralized location:

- **Centralized orchestration**: `packages/opencode/src/session/pipeline.ts:157` — `checkAndHandlePipelineCheckpoint()` is the single function that presents the Continue/Feedback dialog. It is called from `prompt.ts:1630`.
- **Mode files only instruct the LLM** (`packages/opencode/src/session/prompt.ts:1829` calls `sys.skills(agent)` which loads `.am/agent/<mode>.md`). Mode files tell the LLM to *output* a `## PIPELINE CHECKPOINT` block — they do NOT contain orchestration logic.
- The execution rule in mode files ("The user reviews your work at the ## PIPELINE CHECKPOINT block at the end — not before, not during") is duplicated boilerplate, but the actual event-handling IS centralized. The duplication is cosmetic, not architectural.

### Why the dialog doesn't appear — candidate root causes
The function has several silent-return paths:

1. **`currentMode === "chat"`** (line 174) → returns `{ action: "none" }` silently. (Not the issue — chat is explicitly excluded.)

2. **`currentMode === "start"` AND no checkpoint found** (line 208) → returns `{ action: "none" }` silently. If the start mode doesn't output `## PIPELINE CHECKPOINT`, the user sees nothing.

3. **Checkpoint found but `nextMode` not in `VALID_MODES`** (line 272‑278) → silently returns `{ action: "none" }` if no fallback is found in `project.md`. `VALID_MODES` (line 80-83) only includes: `start`, `design`, `frontend`, `backend`, `database`, `security`, `testing`, `devops`, `cleanup`, `documentation`, `chat`. If the LLM outputs `Suggested next mode: architect` (a custom mode the user uses), it silently skips.

4. **Checkpoint not found and mode is not "start"** (line 210‑266) → shows a "Recovery" dialog with "Continue" / "Give feedback". This IS shown, but it's different from the normal Continue/Feedback dialog — the user might not recognize it as the same thing.

5. **`QuestionRejectedError` caught** (line 309‑312) → auto-selects "Continue" silently. This happens if the Question service rejects the deferred (e.g., session cleanup finalizer fires, or UI component rejects the question).

**Most likely root cause**: #3 — the LLM outputs a next mode that is NOT in `VALID_MODES`. The user's `architect` mode is not in `VALID_MODES`, nor are any other custom modes. If architect suggests a next mode like `backend` (which IS in VALID_MODES), it works. But if it ever suggests something unexpected, it silently fails.

**Second most likely**: #4 — the LLM ISN'T outputting the checkpoint block at all, triggering the recovery prompt. But the user said the dialog "stopped appearing" — the recovery prompt IS a dialog, so they'd see it unless they dismissed it.

## Analysis done

### Compared PIPELINE CHECKPOINT sections across all 11 mode files
- 9 of 11 files have the section (chat and documentation are exceptions — chat is non-pipeline, documentation is terminal)
- All use the same regex-matchable format
- Each has a different summary and next-mode suggestion, but the structure is identical
- 4 modes have a typecheck gate before checkpoint. 7 do not.
- No shared template or base file exists — each mode file is standalone Markdown

### Traced the full code path
1. `prompt()` (prompt.ts:1602) calls `loop()` → `runLoop()` → LLM generates response
2. `runLoop()` returns the last assistant message (line 1887)
3. `prompt()` extracts text parts from assistant message (line 1625-1628)
4. `checkAndHandlePipelineCheckpoint()` (pipeline.ts:157) parses the text for `## PIPELINE CHECKPOINT` (line 108)
5. If parsed, validates nextMode against `VALID_MODES` (line 272)
6. If valid, calls `deps.ask()` with "Continue to X?" / "Give feedback" (line 289-308)
7. `deps.ask` → `Question.ask()` → publishes `Event.Asked` to bus → TUI renders dialog → user responds → deferred resolves

### Verified the Question event chain
- `Question.ask()` publishes `"question.asked"` on the bus (question/index.ts:156)
- TUI sync reducer inserts into store (tui/context/sync.tsx:191)
- Question component renders (tui/routes/session/question.tsx)
- User clicks → `Question.reply()` or `Question.reject()` → deferred resolves/rejects

## Progress
### Done
- Full architectural analysis of Continue/Feedback checkpoint flow
- Proved the rule IS already centralized
- Identified VALID_MODES gap as most probable root cause
- Cleaned up from previous session: fixed install.sh (commit 179158ac9), fixed stale `am-` prefixes in 3 files, release v1.14.49 live with 3 assets

### Blocked
- Cannot test the fix without a local dev environment running (needs `bun dev` in tmux)
- No way to confirm VALID_MODES gap is the real issue without log analysis

## Next Steps
1. **Add `architect` to VALID_MODES** in pipeline.ts (line 80-83). Also add any other known modes: `plan`, `intake`, `code-review`, `debug`, `learn`.
2. **Fix silent skip at line 278**: Instead of returning `{ action: "none" }` when no fallback mode is found, log a warning and show a mini dialog ("Mode X suggested next mode Y which is not recognized. Continue anyway?").
3. **Add logging** at line 171: the `console.error("CHECKPOINT HANDLER CALLED")` is already there — verify in logs that the handler IS being called in the user's sessions.
4. **If the handler IS called but no dialog appears**, investigate the bus event delivery to the TUI.

## Relevant Files
- `packages/opencode/src/session/pipeline.ts` — centralized checkpoint handler + VALID_MODES
- `packages/opencode/src/session/prompt.ts` — calls checkpoint handler at line 1630
- `packages/opencode/src/question/index.ts` — Question service (ask/reply/reject)
- `packages/opencode/src/cli/cmd/tui/routes/session/question.tsx` — TUI question component
- `.am/agent/*.md` (user project) — mode files with PIPELINE CHECKPOINT instructions
