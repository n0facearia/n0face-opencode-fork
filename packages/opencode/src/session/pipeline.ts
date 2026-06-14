import path from "path"
import { readFileSync } from "node:fs"
import { Effect, DateTime } from "effect"
import { SessionID } from "./schema"
import { Question } from "../question"
import { SessionEvent } from "@/v2/session-event"
import { SyncEvent } from "@/sync"
import { BUILD_FROM_SOURCE } from "@/version"
import * as Log from "@am-ai/core/util/log"

const log = Log.create({ service: "pipeline" })

let sessionPermission: "granted" | "per-request" | null = null

export function getSessionPermission() {
  return sessionPermission
}

export function setSessionPermission(value: "granted" | "per-request" | null) {
  sessionPermission = value
}

export function askSessionPermission(
  input: { sessionID: SessionID },
  deps: { ask: Question.Interface["ask"] },
): Effect.Effect<void> {
  return Effect.gen(function* () {
    if (!BUILD_FROM_SOURCE) {
      log.warn("Warning: AM is running a prebuilt binary. Run 'am rebuild' to update to your latest local changes.")
    }
    if (sessionPermission !== null) return

    const answers = yield* deps.ask({
      sessionID: input.sessionID,
      questions: [
        new Question.Info({
          question: "Grant AM full file access for this session? (Recommended)",
          header: "File Access",
          options: [
            new Question.Option({
              label: "Yes, full access",
              description: "Never ask again this session",
            }),
            new Question.Option({
              label: "No, ask each time",
              description: "Prompt me before every file operation",
            }),
          ],
          multiple: false,
          custom: false,
        }),
      ],
    })
    const choice = answers[0]?.[0] ?? ""
    sessionPermission = choice.startsWith("Yes") ? "granted" : "per-request"
  })
}

export function initializeSessionPermission(projectDir: string): void {
  if (sessionPermission !== null) return
  try {
    const content = readFileSync(path.join(projectDir, ".am", "project.md"), "utf-8")
    const match = content.match(/file_access:\s*(granted|per-request)/)
    if (match) sessionPermission = match[1] as "granted" | "per-request"
  } catch {
    try {
      const content = readFileSync(path.join(projectDir, ".opencode", "project.md"), "utf-8")
      const match = content.match(/file_access:\s*(granted|per-request)/)
      if (match) sessionPermission = match[1] as "granted" | "per-request"
    } catch {}
  }
}

const VALID_MODES = [
  "start", "design", "frontend", "backend", "database",
  "security", "testing", "devops", "cleanup", "documentation", "chat",
]

function readNextValidModeFromProjectMd(projectDir: string | undefined): string | undefined {
  if (!projectDir) return undefined
  const tryPath = (p: string) => {
    try {
      const content = readFileSync(p, "utf-8")
      const match = content.match(/Modes remaining:\s*\[([^\]]*)\]/)
      if (!match) return undefined
      return match[1].split(",").map((m) => m.trim().toLowerCase().replace(/\s+/g, "-")).find((m) => VALID_MODES.includes(m))
    } catch {
      return undefined
    }
  }
  return tryPath(path.join(projectDir, ".am", "project.md"))
    ?? tryPath(path.join(projectDir, ".opencode", "project.md"))
}

export function parsePipelineCheckpoint(text: string): { nextMode: string; summary: string } | undefined {
  // Normalize line endings (CRLF → LF)
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  // Case-insensitive, tolerant of surrounding whitespace (e.g., "##PIPELINE CHECKPOINT", "##  PIPELINE CHECKPOINT")
  const checkpointMatch = normalized.match(/#{1,3}\s*pipeline\s*checkpoint/i)
  if (!checkpointMatch) {
    log.info("No pipeline checkpoint header found")
    return undefined
  }

  // Extract everything after the checkpoint header
  const afterHeader = normalized.slice(normalized.search(/#{1,3}\s*pipeline\s*checkpoint/i))

  // Match "Suggested next mode" — tolerate optional separator (handles newline before value)
  const modeMatch = afterHeader.match(/suggested\s+next\s+mode\s*[:\-–—]?\s*([^\n.,;]+)/i)
  if (!modeMatch) {
    log.info("No 'suggested next mode' line found in checkpoint")
    return undefined
  }

  // Extract the raw mode name and split on separators (em dash, en dash, spaced-hyphen)
  let nextMode = modeMatch[1]
    .split(/\s*[—–]\s*|\s+-\s+/)[0]
    .trim()
    .toLowerCase()
    .replace(/[.:;,!?\s]+$/, "")
    .replace(/^[.:;,!?\s]+/, "")

  if (!nextMode || nextMode === "none" || nextMode === "pipeline-complete") {
    log.info("Next mode is empty or special: '" + nextMode + "'")
    return undefined
  }

  log.info("Parsed next mode from checkpoint: '" + nextMode + "'")

  // Extract summary — try "Summary:" format, then old "### What was done" format
  let summary = ""
  const summaryMatch = afterHeader.match(/summary\s*[:\-–—]\s*([^\n]+)/i)
  if (summaryMatch) {
    summary = summaryMatch[1].trim()
  } else {
    const oldSummaryMatch = afterHeader.match(/###\s*what\s+was\s+done[^\n]*\n([\s\S]*?)(?=\n###\s|$)/i)
    if (oldSummaryMatch) {
      summary = oldSummaryMatch[1].trim()
    }
  }

  return { nextMode, summary }
}

export function checkAndHandlePipelineCheckpoint(
  input: {
    sessionID: SessionID
    assistantText: string
    currentMode: string
  },
  deps: {
    ask: Question.Interface["ask"]
    sync: SyncEvent.Interface
  },
): Effect.Effect<
  { action: "continue" } | { action: "feedback"; text: string } | { action: "retry" } | { action: "none" }
> {
  const parsed = parsePipelineCheckpoint(input.assistantText)

  if (!parsed) {
    if (input.currentMode === "start") return Effect.succeed({ action: "none" as const })

    return Effect.gen(function* () {
      log.info("No pipeline checkpoint found for " + input.currentMode + " — offering recovery")

      const answers = yield* deps.ask({
        sessionID: input.sessionID,
        questions: [
          new Question.Info({
            question: `${input.currentMode} stopped before completing. Continue or give it more direction?`,
            header: "Recovery",
            options: [
              new Question.Option({
                label: "Continue",
                description: `Re-run ${input.currentMode} mode`,
              }),
              new Question.Option({
                label: "Give feedback",
                description: "Tell the mode what to do next",
              }),
            ],
            multiple: false,
            custom: false,
          }),
        ],
      }).pipe(
        Effect.catchTag("QuestionRejectedError", () =>
          Effect.succeed([["Continue"]] as ReadonlyArray<ReadonlyArray<string>>),
        ),
      )

      const choice = answers[0]?.[0] ?? ""

      if (choice.startsWith("Give feedback")) {
        const feedbackAnswers = yield* deps.ask({
          sessionID: input.sessionID,
          questions: [
            new Question.Info({
              question: `What should ${input.currentMode} do?`,
              header: "Your feedback",
              options: [],
              multiple: false,
              custom: true,
            }),
          ],
        }).pipe(
          Effect.catchTag("QuestionRejectedError", () =>
            Effect.succeed([[]] as ReadonlyArray<ReadonlyArray<string>>),
          ),
        )

        const feedbackText = feedbackAnswers[0]?.[0] ?? ""
        if (!feedbackText) return { action: "retry" as const }

        return { action: "feedback" as const, text: feedbackText }
      }

      return { action: "retry" as const }
    })
  }

  log.info("Raw next mode from checkpoint: '" + parsed.nextMode + "'")
  let nextMode = parsed.nextMode.trim().toLowerCase().replace(/\s+/g, "-").replace(/\.md$/i, "").replace(/.*\//, "")

  if (!VALID_MODES.includes(nextMode)) {
    log.info("Pipeline: unknown mode '" + nextMode + "' — skipping, looking for next valid mode from project.md")
    const fallback = readNextValidModeFromProjectMd(input.projectDir)
    if (fallback) {
      nextMode = fallback
    } else {
      return Effect.succeed({ action: "none" as const })
    }
  }

  return Effect.gen(function* () {
    log.info("Pipeline checkpoint detected: switching to " + nextMode)

    const summaryLines = parsed.summary
      ? `\n\nWhat was done:\n${parsed.summary}`
      : ""

    const answers = yield* deps.ask({
      sessionID: input.sessionID,
      questions: [
        new Question.Info({
          question: `${input.currentMode} mode is complete.${summaryLines}\n\nContinue to ${nextMode} mode?`,
          header: `Continue to ${nextMode}?`,
          options: [
            new Question.Option({
              label: `Continue to ${nextMode}`,
              description: `Switch automatically to ${nextMode} mode and begin`,
            }),
            new Question.Option({
              label: "Give feedback",
              description: "Type what you'd like changed before moving on",
            }),
          ],
          multiple: false,
          custom: false,
        }),
      ],
    }).pipe(
      Effect.catchTag("QuestionRejectedError", () =>
        Effect.succeed([["Continue to " + nextMode]] as ReadonlyArray<ReadonlyArray<string>>),
      ),
    )

    const choice = answers[0]?.[0] ?? ""

    if (choice.startsWith("Give feedback")) {
      const feedbackAnswers = yield* deps.ask({
        sessionID: input.sessionID,
        questions: [
          new Question.Info({
            question: "What would you like changed or clarified before moving on?",
            header: "Your feedback",
            options: [],
            multiple: false,
            custom: true,
          }),
        ],
      }).pipe(
        Effect.catchTag("QuestionRejectedError", () =>
          Effect.succeed([[]] as ReadonlyArray<ReadonlyArray<string>>),
        ),
      )

      const feedbackText = feedbackAnswers[0]?.[0] ?? ""
      if (!feedbackText) {
        yield* deps.sync.run(SessionEvent.AgentSwitched.Sync, {
          sessionID: input.sessionID,
          timestamp: DateTime.makeUnsafe(Date.now()),
          agent: nextMode,
          source: "pipeline",
        })
        return { action: "continue" as const }
      }

      return { action: "feedback" as const, text: feedbackText }
    }

    yield* deps.sync.run(SessionEvent.AgentSwitched.Sync, {
      sessionID: input.sessionID,
      timestamp: DateTime.makeUnsafe(Date.now()),
      agent: nextMode,
      source: "pipeline",
    })
    return { action: "continue" as const }
  })
}

export * as SessionPipeline from "./pipeline"
