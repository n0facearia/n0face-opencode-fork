import path from "path"
import { readFileSync } from "node:fs"
import { Effect, DateTime } from "effect"
import { SessionID } from "./schema"
import { Question } from "../question"
import { SessionEvent } from "@/v2/session-event"
import { SyncEvent } from "@/sync"
import { BUILD_FROM_SOURCE } from "@/version"
import * as Log from "@am-ai/core/util/log"

console.error("PIPELINE MODULE LOADED")
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
  console.error("PERMISSION QUESTION CALLED")
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
    }).pipe(
      Effect.catchTag("QuestionRejectedError", () =>
        Effect.succeed([["No, ask each time"]] as ReadonlyArray<ReadonlyArray<string>>),
      ),
    )
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
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  let nextMode: string | undefined
  let summary = ""

  // Try ## PIPELINE CHECKPOINT format (with Suggested next mode line)
  const pcpMatch = normalized.match(/#{1,3}\s*pipeline\s*checkpoint/i)
  if (pcpMatch) {
    const afterHeader = normalized.slice(pcpMatch.index! + pcpMatch[0].length)
    const modeMatch = afterHeader.match(/suggested\s+next\s+mode\s*[:\-–—]?\s*([^\n.,;]+)/i)
    if (modeMatch) {
      nextMode = modeMatch[1]
        .split(/\s*[—–]\s*|\s+-\s+/)[0]
        .trim()
        .toLowerCase()
        .replace(/[.:;,!?\s]+$/, "")
        .replace(/^[.:;,!?\s]+/, "")
      const summaryMatch = afterHeader.match(/summary\s*[:\-–—]\s*([^\n]+)/i)
      if (summaryMatch) {
        summary = summaryMatch[1].trim()
      } else {
        const oldSummaryMatch = afterHeader.match(/###\s*what\s+was\s+done[^\n]*\n([\s\S]*?)(?=\n###\s|$)/i)
        if (oldSummaryMatch) {
          summary = oldSummaryMatch[1].trim()
        }
      }
      log.info("Parsed next mode from PIPELINE CHECKPOINT: '" + nextMode + "'")
    }
  }

  // Try ## HANDOFF — suggest <mode> format (also supports trailing reason:
  // ## HANDOFF — suggest backend — reason text)
  if (!nextMode) {
    const handoffMatch = normalized.match(/##\s*handoff\s*[—–\-]\s*suggest\s+(\S+)(?:\s*[—–\-]\s*(.*))?/i)
    if (handoffMatch) {
      nextMode = handoffMatch[1].toLowerCase().replace(/[.:;,!?\s]+$/, "").replace(/^[.:;,!?\s]+/, "")
      summary = handoffMatch[2]?.trim() ?? ""
      if (!summary) {
        const after = normalized.slice(handoffMatch.index! + handoffMatch[0].length).trim()
        const line = after.split("\n")[0]?.trim()
        if (line && !line.startsWith("#")) summary = line
      }
      log.info("Parsed next mode from HANDOFF: '" + nextMode + "'")
    }
  }

  // Try "Suggested next step: <mode> — because <reason>" format (used by some projects)
  if (!nextMode) {
    const stepMatch = normalized.match(/suggested\s+next\s+step\s*[:\-–—]?\s*([^\n.,;]+)/i)
    if (stepMatch) {
      const parts = stepMatch[1].split(/\s*[—–]\s*|\s+-\s+/)
      nextMode = parts[0].trim().toLowerCase()
        .replace(/[.:;,!?\s]+$/, "")
        .replace(/^[.:;,!?\s]+/, "")
        .replace(/\s+mode$/i, "")
      if (parts.length > 1) summary = parts.slice(1).join(" — ").trim()
      log.info("Parsed next mode from SUGGESTED NEXT STEP: '" + nextMode + "'")
    }
  }

  if (!nextMode || nextMode === "none" || nextMode === "pipeline-complete") {
    if (!nextMode) log.info("No pipeline checkpoint or handoff header found")
    else log.info("Next mode is special: '" + nextMode + "'")
    return undefined
  }

  return { nextMode, summary }
}

export function checkAndHandlePipelineCheckpoint(
  input: {
    sessionID: SessionID
    assistantText: string
    currentMode: string
    projectDir?: string
  },
  deps: {
    ask: Question.Interface["ask"]
    sync: SyncEvent.Interface
  },
): Effect.Effect<
  { action: "continue" } | { action: "feedback"; text: string } | { action: "retry" } | { action: "none" }
> {
  console.error("CHECKPOINT HANDLER CALLED")

  // Chat mode never handoffs
  if (input.currentMode === "chat") return Effect.succeed({ action: "none" as const })

  const parsed = parsePipelineCheckpoint(input.assistantText)

  // Documentation mode is terminal — no handoff, show pipeline complete message
  if (input.currentMode === "documentation") {
    return Effect.gen(function* () {
      const msg = parsed?.summary
        ? `**Mode complete:** ${parsed.summary}\n\n---\n\nPipeline complete. All modes have run. Enjoy your project! :cat:`
        : "Pipeline complete. All modes have run. Enjoy your project! :cat:"
      yield* deps.ask({
        sessionID: input.sessionID,
        questions: [
          new Question.Info({
            question: msg,
            header: "Pipeline Complete",
            options: [
              new Question.Option({
                label: "Done",
                description: "Acknowledge and finish",
              }),
            ],
            multiple: false,
            custom: false,
          }),
        ],
      }).pipe(
        Effect.catchTag("QuestionRejectedError", () => Effect.void),
      )
      return { action: "none" as const }
    })
  }

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
              new Question.Option({
                label: "Just chatting",
                description: "This was an ad-hoc question, not a mode handoff",
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

      if (choice.startsWith("Just chatting")) return { action: "none" as const }

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
      return Effect.gen(function* () {
        const answers = yield* deps.ask({
          sessionID: input.sessionID,
          questions: [
            new Question.Info({
              question: [
                `The agent suggested switching to \`${nextMode}\` which is not a recognized mode.`,
                `Staying in ${input.currentMode} mode.`,
              ].join("\n\n"),
              header: "Unknown mode",
              options: [
                new Question.Option({
                  label: "OK",
                  description: `Continue in ${input.currentMode} mode`,
                }),
              ],
              multiple: false,
              custom: false,
            }),
          ],
        }).pipe(
          Effect.catchTag("QuestionRejectedError", () =>
            Effect.succeed([["OK"]] as ReadonlyArray<ReadonlyArray<string>>),
          ),
        )
        return { action: "none" as const }
      })
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
