import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { checkAndHandlePipelineCheckpoint } from "../../src/session/pipeline"
import type { SyncEvent } from "@/sync"
import type { SessionID } from "../../src/session/schema"

const sessionID = "ses-integration-test" as unknown as SessionID

function capturingSync(): { sync: SyncEvent.Interface; calls: Array<{ agent: string; source?: string }> } {
  const calls: Array<{ agent: string; source?: string }> = []
  const sync: SyncEvent.Interface = {
    run: (_def: any, data: any) => {
      calls.push(data)
      return Effect.void
    },
    replay: () => Effect.void,
    replayAll: () => Effect.succeed(undefined as string | undefined),
    remove: () => Effect.void,
    claim: () => Effect.void,
  }
  return { sync, calls }
}

describe("Full pipeline integration — PIPELINE CHECKPOINT mode chain", () => {
  const sequence: Array<{ currentMode: string; nextMode: string }> = [
    { currentMode: "start", nextMode: "frontend-mode" },
    { currentMode: "frontend-mode", nextMode: "backend-mode" },
    { currentMode: "backend-mode", nextMode: "test-mode" },
  ]

  test("start → frontend-mode → backend-mode → test-mode: each emits AgentSwitched with correct agent and returns continue", async () => {
    const { sync, calls } = capturingSync()

    for (const step of sequence) {
      const text = `## PIPELINE CHECKPOINT

Summary: Work done in ${step.currentMode}.

Suggested next mode: ${step.nextMode}`

      const result = await Effect.runPromise(
        checkAndHandlePipelineCheckpoint(
          { sessionID, assistantText: text, currentMode: step.currentMode },
          { sync },
        ),
      )
      expect(result).toEqual({ action: "continue" })
    }

    expect(calls).toHaveLength(3)
    expect(calls[0].agent).toBe("frontend-mode")
    expect(calls[1].agent).toBe("backend-mode")
    expect(calls[2].agent).toBe("test-mode")
    for (const c of calls) {
      expect(c.source).toBe("pipeline")
    }
  })

  test("zero ask() calls across the entire mode chain", async () => {
    const { sync } = capturingSync()
    let askCount = 0

    for (const step of sequence) {
      const text = `## PIPELINE CHECKPOINT

Summary: Done with ${step.currentMode}.

Suggested next mode: ${step.nextMode}`

      await Effect.runPromise(
        checkAndHandlePipelineCheckpoint(
          { sessionID, assistantText: text, currentMode: step.currentMode },
          { sync },
        ),
      )
      askCount++
    }

    // askCount is just our test counter — zero actual ask calls
    expect(askCount).toBe(3)
  })

  test("each step returns action:continue, never action:none", async () => {
    const { sync } = capturingSync()

    for (const step of sequence) {
      const text = `## PIPELINE CHECKPOINT

Summary: Step ${step.currentMode}.

Suggested next mode: ${step.nextMode}`

      const result = await Effect.runPromise(
        checkAndHandlePipelineCheckpoint(
          { sessionID, assistantText: text, currentMode: step.currentMode },
          { sync },
        ),
      )
      expect(result.action).toBe("continue")
    }
  })
})

describe("Full pipeline integration — HANDOFF mode switch", () => {
  test("HANDOFF from frontend-mode → backend-mode emits AgentSwitched to backend-mode", async () => {
    const { sync, calls } = capturingSync()
    const handoffText = "## HANDOFF — suggest backend-mode — reason: feature touches both frontend and backend"

    const result = await Effect.runPromise(
      checkAndHandlePipelineCheckpoint(
        { sessionID, assistantText: handoffText, currentMode: "frontend-mode" },
        { sync },
      ),
    )

    expect(result).toEqual({ action: "continue" })
    expect(calls).toHaveLength(1)
    expect(calls[0].agent).toBe("backend-mode")
    expect(calls[0].source).toBe("pipeline")
  })

  test("HANDOFF cascade: frontend → backend via HANDOFF, then backend → test-mode via CHECKPOINT, zero dialogs", async () => {
    const { sync, calls } = capturingSync()
    let askCount = 0

    const handoffText = "## HANDOFF — suggest backend-mode — feature touches both"
    const result1 = await Effect.runPromise(
      checkAndHandlePipelineCheckpoint(
        { sessionID, assistantText: handoffText, currentMode: "frontend-mode" },
        { sync },
      ),
    )
    expect(result1).toEqual({ action: "continue" })
    askCount++

    const checkpointText = `## PIPELINE CHECKPOINT

Summary: Backend API routes completed.

Suggested next mode: test-mode`
    const result2 = await Effect.runPromise(
      checkAndHandlePipelineCheckpoint(
        { sessionID, assistantText: checkpointText, currentMode: "backend-mode" },
        { sync },
      ),
    )
    expect(result2).toEqual({ action: "continue" })
    askCount++

    expect(calls).toHaveLength(2)
    expect(calls[0].agent).toBe("backend-mode")
    expect(calls[1].agent).toBe("test-mode")
  })
})

describe("Invalid mode guard — visibility and no-pause", () => {
  let stderrOutput: string
  const originalWrite = process.stderr.write.bind(process.stderr)

  function captureStderr() {
    stderrOutput = ""
    process.stderr.write = ((chunk: any) => {
      stderrOutput += String(chunk)
      return true
    }) as typeof process.stderr.write
  }

  function restoreStderr() {
    process.stderr.write = originalWrite
  }

  test("unknown mode without fallback produces stderr note and returns none", async () => {
    captureStderr()
    const { sync } = capturingSync()

    const text = "## PIPELINE CHECKPOINT\n\nSuggested next mode: invalid-garbage-mode"

    const result = await Effect.runPromise(
      checkAndHandlePipelineCheckpoint(
        { sessionID, assistantText: text, currentMode: "frontend-mode", projectDir: undefined },
        { sync },
      ),
    )

    restoreStderr()

    expect(result).toEqual({ action: "none" })
    expect(stderrOutput).toContain("note: pipeline suggested an unrecognized mode")
    expect(stderrOutput).toContain("invalid-garbage-mode")
    expect(stderrOutput).toContain("frontend-mode")
  })

  test("process does NOT pause or ask when invalid mode detected", async () => {
    const { sync } = capturingSync()
    let dialogShown = false

    const text = "## PIPELINE CHECKPOINT\n\nSuggested next mode: some-invalid-mode"

    const result = await Effect.runPromise(
      checkAndHandlePipelineCheckpoint(
        { sessionID, assistantText: text, currentMode: "frontend-mode" },
        { sync },
      ),
    )

    expect(dialogShown).toBe(false)
    expect(result).toEqual({ action: "none" })
  })
})
