import { version } from "../../package.json"

const UPSTREAM_REPO = "anomalyco/opencode"
const FORK_REPO = "n0facearia/n0face-opencode-fork"

export type UpdateInfo = { updateAvailable: boolean; version?: string }

function semverGt(a: string, b: string): boolean {
  const pa = a.split(".").map(Number)
  const pb = b.split(".").map(Number)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const ca = pa[i] ?? 0
    const cb = pb[i] ?? 0
    if (ca > cb) return true
    if (ca < cb) return false
  }
  return false
}

async function fetchLatestRelease(repo: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: { Accept: "application/json", "User-Agent": "opencode-app" },
    })
    if (!res.ok) return null
    const data = await res.json() as { tag_name?: string }
    if (typeof data.tag_name !== "string") return null
    return data.tag_name.replace(/^v/, "")
  } catch {
    return null
  }
}

export async function checkUpdate(): Promise<UpdateInfo> {
  const [upstream, fork] = await Promise.all([
    fetchLatestRelease(UPSTREAM_REPO),
    fetchLatestRelease(FORK_REPO),
  ])

  const candidates = [upstream, fork].filter((x): x is string => x !== null)
  let latest = ""
  for (const c of candidates) {
    if (semverGt(c, latest)) latest = c
  }

  if (!latest || !semverGt(latest, version)) return { updateAvailable: false }

  return { updateAvailable: true, version: latest }
}
