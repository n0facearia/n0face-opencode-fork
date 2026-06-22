import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { NodeFileSystem } from "@effect/platform-node"
import path from "path"
import { AppFileSystem } from "@am-ai/core/filesystem"
import { PermissionState } from "@am-ai/core/permission/state"
import { SessionPipeline } from "../../src/session/pipeline"
import { Question } from "../../src/question"
import { SessionID } from "../../src/session/schema"
import { testEffect } from "../lib/effect"

const layer = AppFileSystem.defaultLayer.pipe(Layer.provide(NodeFileSystem.layer))

const it = testEffect(layer)

describe("Session Pipeline — permission flow", () => {
  const reset = () => { SessionPipeline.setSessionPermission(null) }

  it.live("initializeSessionPermission + askSessionPermission: fresh start (no file)", () =>
    Effect.gen(function* () {
      reset()
      const fs = yield* AppFileSystem.Service
      const tmpDir = yield* Effect.sync(() =>
        path.join(import.meta.dir, "..", "..", "..", "core", "test", ".test-tmp-pipeline"),
      )
      yield* Effect.sync(() => {
        try { Bun.spawnSync(["rm", "-rf", tmpDir]) } catch {}
        Bun.spawnSync(["mkdir", "-p", tmpDir])
      })

      yield* SessionPipeline.initializeSessionPermission(fs, tmpDir)
      const before = SessionPipeline.getSessionPermission()
      expect(before).toBeNull()

      const sessionID = SessionID.make("ses-test-permission-flow")
      const mockAsk: Question.Interface["ask"] = () =>
        Effect.succeed([["No, ask each time"]] as ReadonlyArray<ReadonlyArray<string>>)

      yield* SessionPipeline.askSessionPermission(
        { sessionID, projectDir: tmpDir },
        { ask: mockAsk, appfs: fs },
      )
      const after = SessionPipeline.getSessionPermission()
      expect(after).toBe("per-request")

      const granted = yield* PermissionState.isGranted(fs, tmpDir)
      expect(granted).toBe(false)
    }).pipe(Effect.scoped),
  )

  it.live("askSessionPermission with 'Yes' creates permission-state.json", () =>
    Effect.gen(function* () {
      reset()
      const fs = yield* AppFileSystem.Service
      const tmpDir = yield* Effect.sync(() =>
        path.join(import.meta.dir, "..", "..", "..", "core", "test", ".test-tmp-pipeline-yes"),
      )
      yield* Effect.sync(() => {
        try { Bun.spawnSync(["rm", "-rf", tmpDir]) } catch {}
        Bun.spawnSync(["mkdir", "-p", tmpDir])
      })

      const sessionID = SessionID.make("ses-test-permission-flow-yes")
      const mockAsk: Question.Interface["ask"] = () =>
        Effect.succeed([["Yes, full access"]] as ReadonlyArray<ReadonlyArray<string>>)

      yield* SessionPipeline.askSessionPermission(
        { sessionID, projectDir: tmpDir },
        { ask: mockAsk, appfs: fs },
      )
      const permission = SessionPipeline.getSessionPermission()
      expect(permission).toBe("granted")

      const granted = yield* PermissionState.isGranted(fs, tmpDir)
      expect(granted).toBe(true)
    }).pipe(Effect.scoped),
  )

  it.live("initializeSessionPermission reads existing file, askSessionPermission skips dialog", () =>
    Effect.gen(function* () {
      reset()
      const fs = yield* AppFileSystem.Service
      const tmpDir = yield* Effect.sync(() =>
        path.join(import.meta.dir, "..", "..", "..", "core", "test", ".test-tmp-pipeline-restart"),
      )
      yield* Effect.sync(() => {
        try { Bun.spawnSync(["rm", "-rf", tmpDir]) } catch {}
        Bun.spawnSync(["mkdir", "-p", tmpDir])
      })

      yield* PermissionState.grant(fs, tmpDir)

      yield* SessionPipeline.initializeSessionPermission(fs, tmpDir)
      expect(SessionPipeline.getSessionPermission()).toBe("granted")

      let askCalled = false
      const mockAsk: Question.Interface["ask"] = () => {
        askCalled = true
        return Effect.succeed([["Yes, full access"]] as ReadonlyArray<ReadonlyArray<string>>)
      }

      const sessionID = SessionID.make("ses-test-permission-flow-restart")
      yield* SessionPipeline.askSessionPermission(
        { sessionID, projectDir: tmpDir },
        { ask: mockAsk, appfs: fs },
      )

      expect(askCalled).toBe(false)
      expect(SessionPipeline.getSessionPermission()).toBe("granted")
    }).pipe(Effect.scoped),
  )

  it.live("double grant is idempotent — file persists across calls", () =>
    Effect.gen(function* () {
      reset()
      const fs = yield* AppFileSystem.Service
      const tmpDir = yield* Effect.sync(() =>
        path.join(import.meta.dir, "..", "..", "..", "core", "test", ".test-tmp-pipeline-double"),
      )
      yield* Effect.sync(() => {
        try { Bun.spawnSync(["rm", "-rf", tmpDir]) } catch {}
        Bun.spawnSync(["mkdir", "-p", tmpDir])
      })

      const sessionID = SessionID.make("ses-test-double")
      const mockYes: Question.Interface["ask"] = () =>
        Effect.succeed([["Yes, full access"]] as ReadonlyArray<ReadonlyArray<string>>)

      yield* SessionPipeline.askSessionPermission(
        { sessionID, projectDir: tmpDir },
        { ask: mockYes, appfs: fs },
      )
      expect(SessionPipeline.getSessionPermission()).toBe("granted")

      SessionPipeline.setSessionPermission(null)
      yield* SessionPipeline.initializeSessionPermission(fs, tmpDir)
      expect(SessionPipeline.getSessionPermission()).toBe("granted")

      let askCalled = false
      const mockAsk: Question.Interface["ask"] = () => {
        askCalled = true
        return Effect.succeed([["No, ask each time"]] as ReadonlyArray<ReadonlyArray<string>>)
      }

      yield* SessionPipeline.askSessionPermission(
        { sessionID, projectDir: tmpDir },
        { ask: mockAsk, appfs: fs },
      )
      expect(askCalled).toBe(false)
    }).pipe(Effect.scoped),
  )
})
