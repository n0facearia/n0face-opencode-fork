export * as PermissionState from "./state"

import path from "path"
import { Effect } from "effect"
import type { AppFileSystem } from "../filesystem"

export interface State {
  readonly filesystemWrite: true
  readonly grantedAt: string
}

export function filePath(projectDir: string) {
  const dir = process.env.AM === "1" ? ".am" : ".opencode"
  return path.join(projectDir, dir, "permission-state.json")
}

export const isGranted = Effect.fn("PermissionState.isGranted")(function* (
  fs: AppFileSystem.Interface,
  projectDir: string,
) {
  const fp = filePath(projectDir)
  const exists = yield* fs.exists(fp).pipe(Effect.orElseSucceed(() => false))
  if (!exists) return false
  const content = yield* fs.readFileString(fp).pipe(Effect.orElseSucceed(() => undefined))
  if (!content) return false
  try {
    return JSON.parse(content).filesystemWrite === true
  } catch {
    return false
  }
})

export const grant = Effect.fn("PermissionState.grant")(function* (
  fs: AppFileSystem.Interface,
  projectDir: string,
) {
  const fp = filePath(projectDir)
  const payload = JSON.stringify({ filesystemWrite: true, grantedAt: new Date().toISOString() }, null, 2)

  const write = Effect.fnUntraced(function* () {
    yield* fs.makeDirectory(path.dirname(fp), { recursive: true })
    yield* fs.writeFileString(fp, payload)
  })

  const done = yield* write().pipe(Effect.catch(() => Effect.succeed(false as const)))
  if (done === false) {
    yield* write().pipe(
      Effect.catch(() =>
        Effect.sync(() => console.error("Could not save permission — check disk space/permissions. Automation may re-prompt."))
      ),
    )
  }
})
