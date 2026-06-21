import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { parsePipelineCheckpoint, checkAndHandlePipelineCheckpoint } from "../../src/session/pipeline"
import type { SessionID } from "../../src/session/schema"

const sampleCheckpoint = `## Some work done

Some content here.

## PIPELINE CHECKPOINT

Summary: Created the database schema with Drizzle ORM, set up migrations, and added CRUD endpoints.

Suggested next mode: frontend`

const checkpointNoSummary = `## PIPELINE CHECKPOINT

Suggested next mode: frontend`

describe("parsePipelineCheckpoint", () => {
  test("extracts next mode and summary from a full checkpoint block", () => {
    const result = parsePipelineCheckpoint(sampleCheckpoint)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("frontend")
    expect(result!.summary).toContain("Created the database schema")
  })

  test("extracts next mode without summary", () => {
    const result = parsePipelineCheckpoint(checkpointNoSummary)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("frontend")
    expect(result!.summary).toBe("")
  })

  test("returns undefined for text without a checkpoint block", () => {
    const result = parsePipelineCheckpoint("Just a normal assistant response without checkpoint")
    expect(result).toBeUndefined()
  })

  test("returns undefined for empty string", () => {
    const result = parsePipelineCheckpoint("")
    expect(result).toBeUndefined()
  })

  test("returns undefined when next mode is 'none'", () => {
    const text = `## PIPELINE CHECKPOINT

Summary: All tests pass.

Suggested next mode: none`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeUndefined()
  })

  test("returns undefined when next mode is 'pipeline-complete'", () => {
    const text = `## PIPELINE CHECKPOINT

Summary: Generated API docs.

Suggested next mode: pipeline-complete`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeUndefined()
  })

  test("handles em dash separator in next mode line", () => {
    const     text = `## PIPELINE CHECKPOINT

Suggested next mode: testing — Set up CI/CD pipeline`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("testing")
  })

  test("handles hyphen separator in next mode line", () => {
    const text = `## PIPELINE CHECKPOINT

Suggested next mode: database - Write unit and integration tests`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("database")
  })

  test("ignores text before the checkpoint block", () => {
    const text = `I've completed the initial setup.

Let me summarize what was done.

## PIPELINE CHECKPOINT

Summary: Initialized the project.

Suggested next mode: start — Begin development`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("start")
  })

  test("handles checkpoint marker without extra dashes", () => {
    const text = `## PIPELINE CHECKPOINT

Summary: Work done.

Suggested next mode: frontend — Build the UI`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("frontend")
  })

  test("parses old format for backward compatibility", () => {
    const text = `## PIPELINE CHECKPOINT — backend

### What was done this session
- Created the database schema with Drizzle ORM
- Set up migrations

### Suggested next mode
frontend — Build the React frontend`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("frontend")
    expect(result!.summary).toContain("Created the database schema")
  })

  test("handles checkpoint with ### instead of ##", () => {
    const text = `### PIPELINE CHECKPOINT

Suggested next mode: backend`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("backend")
  })

  test("handles checkpoint with extra spaces around header", () => {
    const text = `##   PIPELINE   CHECKPOINT   

Suggested next mode: frontend`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("frontend")
  })

  test("handles 'Suggested next mode' with different casing", () => {
    const text = `## PIPELINE CHECKPOINT

SUGGESTED NEXT MODE: design`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("design")
  })

  test("handles 'Suggested next mode' with capital first letter", () => {
    const text = `## PIPELINE CHECKPOINT

Suggested Next Mode: database`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("security")
  })

  test("handles checkpoint with CRLF line endings (Windows)", () => {
    const text = `## PIPELINE CHECKPOINT\r\n\r\nSuggested next mode: testing`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("testing")
  })

  test("handles summary with em dash separator", () => {
    const text = `## PIPELINE CHECKPOINT

Summary — Set up authentication and authorization
Suggested next mode: database`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("database")
  })

  test("handles multiple spaces before mode name", () => {
    const text = `## PIPELINE CHECKPOINT

Suggested next mode:   frontend`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("frontend")
  })

  test("removes trailing punctuation from mode name", () => {
    const text = `## PIPELINE CHECKPOINT

Suggested next mode: backend.`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("backend")
  })

  test("handles checkpoint block with trailing content on same line", () => {
    const text = `## PIPELINE CHECKPOINT - session complete

Summary: Work is done.

Suggested next mode: cleanup — Final cleanup tasks`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("cleanup")
  })

  test("handles checkpoint block in the middle of other text", () => {
    const text = `I've completed the frontend work.
The login page is now responsive.

## PIPELINE CHECKPOINT

Summary: Finished the login page component with form validation.

Suggested next mode: backend

Now I need to set up the API routes for authentication.`
    const result = parsePipelineCheckpoint(text)
    expect(result).toBeDefined()
    expect(result!.nextMode).toBe("backend")
    expect(result!.summary).toContain("Finished the login page")
  })
})

describe("checkAndHandlePipelineCheckpoint — chat mode exclusion", () => {
  const sessionID = "ses-test-chat" as unknown as SessionID

  const noopAsk = () =>
    Effect.die("ask must not be called when currentMode === 'chat'")

  const noopSync = {
    run: () =>
      Effect.die("sync.run must not be called when currentMode === 'chat'"),
    replay: () =>
      Effect.die("sync.replay must not be called for chat test"),
    replayAll: () =>
      Effect.die("sync.replayAll must not be called for chat test"),
    remove: () =>
      Effect.die("sync.remove must not be called for chat test"),
    claim: () =>
      Effect.die("sync.claim must not be called for chat test"),
  }

  test("returns { action: 'none' } for chat mode even when output contains HANDOFF marker", async () => {
    const result = await Effect.runPromise(
      checkAndHandlePipelineCheckpoint(
        {
          sessionID,
          assistantText: "## HANDOFF — suggest backend",
          currentMode: "chat",
        },
        { ask: noopAsk, sync: noopSync },
      ),
    )
    expect(result).toEqual({ action: "none" })
  })

  test("returns { action: 'none' } for chat mode even when output contains PIPELINE CHECKPOINT", async () => {
    const result = await Effect.runPromise(
      checkAndHandlePipelineCheckpoint(
        {
          sessionID,
          assistantText:
            "## PIPELINE CHECKPOINT\n\nSummary: Done.\n\nSuggested next mode: backend",
          currentMode: "chat",
        },
        { ask: noopAsk, sync: noopSync },
      ),
    )
    expect(result).toEqual({ action: "none" })
  })

  test("returns { action: 'none' } for chat mode with normal Q&A output", async () => {
    const result = await Effect.runPromise(
      checkAndHandlePipelineCheckpoint(
        {
          sessionID,
          assistantText:
            "The auth middleware uses JWT tokens stored in httpOnly cookies.",
          currentMode: "chat",
        },
        { ask: noopAsk, sync: noopSync },
      ),
    )
    expect(result).toEqual({ action: "none" })
  })

  test("non-chat mode with valid checkpoint calls ask to confirm", async () => {
    let askCalled = false
    const confirmAsk = () => {
      askCalled = true
      return Effect.succeed(
        [["Continue to backend"]] as ReadonlyArray<ReadonlyArray<string>>,
      )
    }
    const confirmSync = {
      run: () => Effect.void,
      replay: () => Effect.void,
      replayAll: () => Effect.succeed(undefined as string | undefined),
      remove: () => Effect.void,
      claim: () => Effect.void,
    }

    const result = await Effect.runPromise(
      checkAndHandlePipelineCheckpoint(
        {
          sessionID,
          assistantText:
            "## PIPELINE CHECKPOINT\n\nSummary: Done.\n\nSuggested next mode: backend",
          currentMode: "backend",
        },
        { ask: confirmAsk, sync: confirmSync },
      ),
    )

    expect(askCalled).toBe(true)
    expect(result).toEqual({ action: "continue" })
  })
})
