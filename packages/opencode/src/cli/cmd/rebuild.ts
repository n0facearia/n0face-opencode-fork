import * as prompts from "@clack/prompts"
import { UI } from "../ui"
import { execSync } from "node:child_process"
import { existsSync, readdirSync } from "node:fs"
import path from "node:path"


const REPO = "n0facearia/n0face-opencode-fork"
const BUILD_DIR = process.env.AM_BUILD_DIR || `${process.env.HOME}/.am/build`
const BIN_DIR = `${process.env.HOME}/.am/bin`

function run(cmd: string, cwd?: string) {
  execSync(cmd, { cwd, stdio: "inherit", encoding: "utf-8" })
}

function isLocalRepo() {
  try {
    existsSync(path.join(process.cwd(), "packages/opencode/package.json"))
    return true
  } catch {
    return false
  }
}

export const RebuildCommand = {
  command: "rebuild",
  describe: "rebuild AM from source",
  handler: async () => {
    UI.empty()
    UI.println(UI.logo("  "))
    UI.empty()
    prompts.intro("Rebuild")

    try {
      execSync("which git", { stdio: "pipe" })
    } catch {
      prompts.log.error("git is required")
      prompts.outro("Done")
      return
    }
    try {
      execSync("which bun", { stdio: "pipe" })
    } catch {
      prompts.log.error("bun is required")
      prompts.outro("Done")
      return
    }

    const spinner = prompts.spinner()

    try {
      const local = isLocalRepo()
      const sourceDir = local ? process.cwd() : BUILD_DIR

      if (!local) {
        const gitDir = `${BUILD_DIR}/.git`
        const repoExists = existsSync(gitDir)

        if (repoExists) {
          spinner.message("Updating existing source...")
          run(`git fetch --tags origin`, BUILD_DIR)
          run(`(git checkout main || true); git pull --ff-only`, BUILD_DIR)
        } else {
          spinner.message("Cloning repository...")
          run(`rm -rf "${BUILD_DIR}"`)
          run(`git clone --depth=1 https://github.com/${REPO}.git "${BUILD_DIR}"`)
        }
      } else {
        spinner.message("Using local source...")
      }

      spinner.message("Installing dependencies...")
      run(`bun install --ignore-scripts`, sourceDir)

      spinner.message("Building binary (this may take a few minutes)...")
      run(`bun run build --single --skip-install`, path.join(sourceDir, "packages/opencode"))

      spinner.message("Installing AM binary...")
      run(`mkdir -p "${BIN_DIR}" "${process.env.HOME}/.local/bin"`)

      const distDir = path.join(sourceDir, "packages/opencode/dist")
      const entries = readdirSync(distDir)
      const built = entries.find((e: string) => e.startsWith("am-")) || entries.find((e: string) => e === "opencode")
      if (!built) throw new Error(`built binary not found in ${distDir}`)

      const srcBin = path.join(distDir, built, "bin/am")
      run(`cp -f "${srcBin}" "${BIN_DIR}/am"`)
      run(`chmod +x "${BIN_DIR}/am"`)
      run(`cp "${BIN_DIR}/am" "${process.env.HOME}/.local/bin/am"`)

      spinner.stop("Rebuild complete")
      prompts.log.success("AM rebuilt from source")
    } catch (e) {
      spinner.stop("Rebuild failed", 1)
      const msg = e instanceof Error ? e.message.trim() : String(e)
      prompts.log.error(msg)
    }

    prompts.outro("Done")
  },
}
