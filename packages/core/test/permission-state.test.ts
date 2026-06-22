import { describe, expect, test } from "bun:test"
import { Effect, Layer, Scope } from "effect"
import { NodeFileSystem } from "@effect/platform-node"
import path from "path"
import { PermissionState } from "../src/permission/state"
import { AppFileSystem } from "../src/filesystem"

describe("PermissionState", () => {
  const layer = AppFileSystem.defaultLayer.pipe(Layer.provide(NodeFileSystem.layer))

  test("grant creates permission-state.json and isGranted returns true", async () => {
    const tmpDir = path.join(import.meta.dir, ".test-tmp-permission")
    await Bun.spawn(["rm", "-rf", tmpDir]).exited
    await Bun.spawn(["mkdir", "-p", tmpDir]).exited

    const program = Effect.gen(function* () {
      const fs = yield* AppFileSystem.Service
      yield* PermissionState.grant(fs, tmpDir)
      const granted = yield* PermissionState.isGranted(fs, tmpDir)
      return granted
    })

    const result = await Effect.runPromise(program.pipe(Effect.provide(layer), Effect.scoped))
    expect(result).toBe(true)

    const fp = path.join(tmpDir, ".opencode", "permission-state.json")
    const content = await Bun.file(fp).text()
    const parsed = JSON.parse(content)
    expect(parsed.filesystemWrite).toBe(true)
    expect(typeof parsed.grantedAt).toBe("string")
  })

  test("isGranted returns false after file deleted", async () => {
    const tmpDir = path.join(import.meta.dir, ".test-tmp-permission-2")
    await Bun.spawn(["rm", "-rf", tmpDir]).exited
    await Bun.spawn(["mkdir", "-p", tmpDir]).exited

    const program = Effect.gen(function* () {
      const fs = yield* AppFileSystem.Service
      yield* PermissionState.grant(fs, tmpDir)
      const fp = path.join(tmpDir, ".opencode", "permission-state.json")
      yield* fs.remove(fp)
      return yield* PermissionState.isGranted(fs, tmpDir)
    })

    const result = await Effect.runPromise(program.pipe(Effect.provide(layer), Effect.scoped))
    expect(result).toBe(false)
  })

  test("isGranted returns false for non-existent file", async () => {
    const tmpDir = path.join(import.meta.dir, ".test-tmp-permission-3")
    await Bun.spawn(["rm", "-rf", tmpDir]).exited
    await Bun.spawn(["mkdir", "-p", tmpDir]).exited

    const program = Effect.gen(function* () {
      const fs = yield* AppFileSystem.Service
      return yield* PermissionState.isGranted(fs, tmpDir)
    })

    const result = await Effect.runPromise(program.pipe(Effect.provide(layer), Effect.scoped))
    expect(result).toBe(false)
  })

  test("grant is idempotent — calling twice does not fail", async () => {
    const tmpDir = path.join(import.meta.dir, ".test-tmp-permission-4")
    await Bun.spawn(["rm", "-rf", tmpDir]).exited
    await Bun.spawn(["mkdir", "-p", tmpDir]).exited

    const program = Effect.gen(function* () {
      const fs = yield* AppFileSystem.Service
      yield* PermissionState.grant(fs, tmpDir)
      yield* PermissionState.grant(fs, tmpDir)
      return yield* PermissionState.isGranted(fs, tmpDir)
    })

    const result = await Effect.runPromise(program.pipe(Effect.provide(layer), Effect.scoped))
    expect(result).toBe(true)
  })
})
