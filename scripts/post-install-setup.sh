#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG_DIR="${HOME}/.config/am"

echo "=== Post-install setup ==="

# 1. Global mode files
echo "-> Copying mode files to ${CONFIG_DIR}/agent/"
mkdir -p "${CONFIG_DIR}/agent/"
cp "${REPO_DIR}/.am/agent/"*.md "${CONFIG_DIR}/agent/"

# 2. Global skill
echo "-> Copying design-taste-frontend skill to ${CONFIG_DIR}/skills/"
mkdir -p "${CONFIG_DIR}/skills/"
cp -r "${REPO_DIR}/.agents/skills/design-taste-frontend" "${CONFIG_DIR}/skills/"

# 3. Merge MCP servers into am.jsonc
echo "-> Adding MCP servers to ${CONFIG_DIR}/am.jsonc"
if command -v jq &>/dev/null; then
  TMP=$(mktemp)
  jq -s '
    .[0] as $existing |
    .[1].mcpServers |
    to_entries |
    map({key: .key, value: {type: "local", command: [.value.command] + .value.args}}) |
    from_entries as $new_mcp |
    $existing | .mcp = (($existing.mcp // {}) + $new_mcp)
  ' "${CONFIG_DIR}/am.jsonc" "${REPO_DIR}/.mcp.json" > "$TMP"
  mv "$TMP" "${CONFIG_DIR}/am.jsonc"
  echo "   Merged using jq"
else
  echo "   WARNING: jq not found. Add MCP servers manually to ${CONFIG_DIR}/am.jsonc"
  echo "   Reference servers in ${REPO_DIR}/.mcp.json"
fi

# 4. Reminder about emil-design-eng
if [ ! -d "${HOME}/.claude/skills/emil-design-eng" ]; then
  echo ""
  echo "NOTE: emil-design-eng skill is not in the repo."
  echo "Reinstall it with: npx skills install emil-design-eng --location ~/.claude/skills"
fi

echo "=== Done ==="
