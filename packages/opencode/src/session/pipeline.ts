import path from "path"
import { readFileSync } from "node:fs"
import { Effect, DateTime } from "effect"
import { SessionID } from "./schema"
import { Question } from "../question"
import { SessionEvent } from "@/v2/session-event"
import { SyncEvent } from "@/sync"
import { BUILD_FROM_SOURCE } from "@/version"
import * as Log from "@am-ai/core/util/log"
import { PermissionState } from "@am-ai/core/permission/state"
import { NamedError } from "@am-ai/core/util/error"
import type { Bus } from "../bus"
import type { AppFileSystem } from "@am-ai/core/filesystem"
import * as Session from "./session"

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
  input: { sessionID: SessionID; projectDir: string },
  deps: { ask: Question.Interface["ask"]; appfs: AppFileSystem.Interface },
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
    if (choice.startsWith("Yes")) {
      sessionPermission = "granted"
      yield* PermissionState.grant(deps.appfs, input.projectDir)
    } else {
      sessionPermission = "per-request"
    }
  })
}

export function initializeSessionPermission(
  appfs: AppFileSystem.Interface,
  projectDir: string,
): Effect.Effect<void> {
  return Effect.gen(function* () {
    if (sessionPermission !== null) return
    const granted = yield* PermissionState.isGranted(appfs, projectDir)
    if (granted) sessionPermission = "granted"
  })
}

export const VALID_MODES = [
  "start", "frontend-mode", "backend-mode", "test-mode", "chat",
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

function publishNote(
  bus: Bus.Interface | undefined,
  sessionID: SessionID,
  message: string,
): Effect.Effect<void> {
  process.stderr.write("note: " + message + "\n")
  if (bus) {
    return bus.publish(Session.Event.Error, {
      sessionID,
      error: new NamedError.Unknown({ message }).toObject(),
    })
  }
  return Effect.void
}

export function checkAndHandlePipelineCheckpoint(
  input: {
    sessionID: SessionID
    assistantText: string
    currentMode: string
    projectDir?: string
  },
  deps: {
    sync: SyncEvent.Interface
    bus?: Bus.Interface
  },
): Effect.Effect<{ action: "continue" } | { action: "none" }> {
  console.error("CHECKPOINT HANDLER CALLED")

  // Chat mode never handoffs
  if (input.currentMode === "chat") return Effect.succeed({ action: "none" as const })

  const parsed = parsePipelineCheckpoint(input.assistantText)

  if (!parsed) {
    if (input.currentMode === "start") return Effect.succeed({ action: "none" as const })
    return Effect.succeed({ action: "none" as const })
  }

  log.info("Raw next mode from checkpoint: '" + parsed.nextMode + "'")
  let nextModeCanonical = parsed.nextMode.trim().toLowerCase().replace(/\s+/g, "-").replace(/\.md$/i, "").replace(/.*\//, "")

  return Effect.gen(function* () {
    if (!VALID_MODES.includes(nextModeCanonical)) {
      log.info("Pipeline: unknown mode '" + nextModeCanonical + "' — skipping, looking for next valid mode from project.md")
      const fallback = readNextValidModeFromProjectMd(input.projectDir)
      if (fallback) {
        yield* publishNote(deps.bus, input.sessionID, "mode '" + nextModeCanonical + "' not recognized — continuing with '" + fallback + "' from project.md")
        log.info("Pipeline: using fallback mode '" + fallback + "' from project.md")
        nextModeCanonical = fallback
      } else {
        yield* publishNote(deps.bus, input.sessionID, "pipeline suggested an unrecognized mode ('" + nextModeCanonical + "') — staying in " + input.currentMode)
        return { action: "none" as const }
      }
    }

    log.info("Pipeline checkpoint detected: switching to " + nextModeCanonical)

    yield* deps.sync.run(SessionEvent.AgentSwitched.Sync, {
      sessionID: input.sessionID,
      timestamp: DateTime.makeUnsafe(Date.now()),
      agent: nextModeCanonical,
      source: "pipeline",
    })
    return { action: "continue" as const }
  })
}

export * as SessionPipeline from "./pipeline"
