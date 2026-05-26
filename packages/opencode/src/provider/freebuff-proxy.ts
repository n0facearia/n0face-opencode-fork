import http from "http"
import { spawn } from "child_process"
import { execSync } from "child_process"
import { randomBytes } from "crypto"

export const FREEBUFF_PROXY_PORT = 4891

let proxyStarted = false
let server: http.Server | null = null

function getFreebuffCommand(): string {
  try {
    execSync("which freebuff", { stdio: "pipe" })
    return "freebuff"
  } catch {
    try {
      execSync("which npx", { stdio: "pipe" })
      return "npx freebuff"
    } catch {
      throw new Error("Freebuff not found: neither 'freebuff' nor 'npx freebuff' is available")
    }
  }
}

function stripAnsiCodes(text: string): string {
  return text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "")
}

function isCliArtifact(line: string): boolean {
  const trimmed = line.trim()
  // Lines that are purely box-drawing characters, dashes, equals, or whitespace
  if (trimmed === "") return true
  if (/^[┌┐└┘├┤┬┴┼│─═]+$/.test(trimmed)) return true
  if (/^[\-=]+$/.test(trimmed)) return true
  if (/^[\s]+$/.test(trimmed)) return true
  return false
}

function cleanOutput(output: string): string {
  const stripped = stripAnsiCodes(output)
  const lines = stripped.split("\n")
  const cleaned = lines.filter((line) => !isCliArtifact(line))
  return cleaned.join("\n").trim()
}

export async function startFreebuffProxy(): Promise<void> {
  if (proxyStarted) {
    console.log("[freebuff-proxy] already started, skipping")
    return
  }

  proxyStarted = true
  console.log(`[freebuff-proxy] starting on port ${FREEBUFF_PROXY_PORT}`)

  server = http.createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/v1/chat/completions") {
      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Not found" }))
      return
    }

    let body = ""
    req.on("data", (chunk) => {
      body += chunk.toString()
    })

    req.on("end", async () => {
      try {
        console.log("[freebuff-proxy] received request")
        const payload = JSON.parse(body)
        const messages = payload.messages || []

        // Build prompt from messages
        const prompt = messages.map((msg: any) => `${msg.role.toUpperCase()}:\n${msg.content}`).join("\n\n")

        console.log("[freebuff-proxy] spawning Freebuff...")
        const command = getFreebuffCommand()
        const [cmd, ...args] = command.split(" ")
        const freebuffProcess = spawn(cmd, [...args, prompt], {
          timeout: 120000,
        })

        const chunks: string[] = []
        let stderrOutput = ""
        let hasError = false

        freebuffProcess.stdout!.on("data", (data: Buffer) => {
          chunks.push(data.toString())
        })

        freebuffProcess.stderr!.on("data", (data: Buffer) => {
          const stderr = data.toString()
          stderrOutput += stderr
          if (stderr.toLowerCase().includes("error") || stderr.toLowerCase().includes("fatal")) {
            hasError = true
          }
        })

        const timeoutId = setTimeout(() => {
          freebuffProcess.kill()
          console.log("[freebuff-proxy] request timed out after 120 seconds")
          res.writeHead(500, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: { message: "Freebuff request timed out" } }))
        }, 120000)

        freebuffProcess.on("close", (code) => {
          clearTimeout(timeoutId)

          if (code !== 0 || hasError) {
            console.log(`[freebuff-proxy] Freebuff exited with code ${code}`, { stderr: stderrOutput })
            res.writeHead(500, { "Content-Type": "application/json" })
            res.end(
              JSON.stringify({
                error: { message: `Freebuff failed: ${stderrOutput || `exit code ${code}`}` },
              }),
            )
            return
          }

          const output = chunks.join("")
          const cleanedOutput = cleanOutput(output)
          console.log("[freebuff-proxy] Freebuff completed successfully")

          const response = {
            id: `chatcmpl-${randomBytes(16).toString("hex")}`,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: "freebuff",
            choices: [
              {
                index: 0,
                message: {
                  role: "assistant",
                  content: cleanedOutput,
                },
                finish_reason: "stop",
              },
            ],
            usage: {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0,
            },
          }

          res.writeHead(200, { "Content-Type": "application/json" })
          res.end(JSON.stringify(response))
        })

        freebuffProcess.on("error", (err) => {
          clearTimeout(timeoutId)
          console.log("[freebuff-proxy] Freebuff spawn error:", err.message)
          res.writeHead(500, { "Content-Type": "application/json" })
          res.end(
            JSON.stringify({
              error: { message: `Failed to spawn Freebuff: ${err.message}` },
            }),
          )
        })
      } catch (err) {
        console.log("[freebuff-proxy] request error:", err)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            error: { message: `Request error: ${err instanceof Error ? err.message : String(err)}` },
          }),
        )
      }
    })
  })

  server.listen(FREEBUFF_PROXY_PORT, "127.0.0.1", () => {
    console.log(`[freebuff-proxy] listening on 127.0.0.1:${FREEBUFF_PROXY_PORT}`)
  })

  server.on("error", (err) => {
    console.error("[freebuff-proxy] server error:", err)
    proxyStarted = false
    server = null
  })
}
