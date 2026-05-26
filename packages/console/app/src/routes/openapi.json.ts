export async function GET() {
  const response = await fetch(
    "https://raw.githubusercontent.com/n0facearia/n0face-opencode-fork/refs/heads/dev/packages/sdk/openapi.json",
  )
  const json = await response.json()
  return json
}
