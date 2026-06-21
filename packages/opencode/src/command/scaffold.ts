export * as Scaffold from "./scaffold"

import path from "path"
import fs from "fs/promises"
import { Effect } from "effect"
import { Global } from "@am-ai/core/global"
import { SessionPipeline } from "@/session/pipeline"

function copyIfExists(src: string, dst: string): Promise<void> {
  return fs.access(src).then(() => fs.cp(src, dst, { recursive: true }), () => {})
}

async function scaffoldModes(projectDir: string) {
  const configDir = Global.Path.config
  const modesDir = path.join(projectDir, "Modes .md files")

  await fs.mkdir(modesDir, { recursive: true })

  for (const mode of SessionPipeline.VALID_MODES) {
    const modeDir = path.join(modesDir, mode)
    await fs.mkdir(modeDir, { recursive: true })

    await copyIfExists(path.join(configDir, "agent", `${mode}.md`), path.join(modeDir, `${mode}.md`))

    await copyIfExists(path.join(configDir, "skills"), path.join(modeDir, "skills"))
  }
}

export const runNewProject = Effect.fn("Scaffold.runNewProject")(function* (projectDir: string) {
  yield* Effect.promise(() => scaffoldModes(projectDir))
})

export const runContinueProject = Effect.fn("Scaffold.runContinueProject")(function* (projectDir: string) {
  yield* Effect.promise(() => scaffoldModes(projectDir))
})
