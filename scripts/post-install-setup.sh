#!/usr/bin/env bash
set -euo pipefail

REPO="n0facearia/n0face-opencode-fork"
BRANCH="main"
RAW="https://raw.githubusercontent.com/$REPO/$BRANCH"
CONFIG="${HOME}/.config/am"

echo "=== Post-install setup ==="
mkdir -p "$CONFIG/agent" "$CONFIG/skills/design-taste-frontend"

echo "-> Downloading mode files"
for f in backend chat cleanup database design devops documentation frontend security start testing; do
  curl -sSf "$RAW/.am/agent/$f.md" -o "$CONFIG/agent/$f.md"
done

echo "-> Downloading design-taste-frontend skill"
curl -sSf "$RAW/.agents/skills/design-taste-frontend/SKILL.md" -o "$CONFIG/skills/design-taste-frontend/SKILL.md"

echo "-> Adding MCP servers to am.jsonc"
MCP=$(curl -sSf "$RAW/.mcp.json" | jq '.mcpServers | to_entries | map({key, value: {type: "local", command: [.value.command] + .value.args}}) | from_entries')
if [ -f "$CONFIG/am.jsonc" ]; then
  jq --argjson mcp "$MCP" '.mcp = ((.mcp // {}) + $mcp)' "$CONFIG/am.jsonc" > "$CONFIG/am.jsonc.tmp" && mv "$CONFIG/am.jsonc.tmp" "$CONFIG/am.jsonc"
else
  jq -n --argjson mcp "$MCP" '{"$schema": "https://opencode.ai/config.json", mcp: $mcp}' > "$CONFIG/am.jsonc"
fi

echo "=== Done ==="
