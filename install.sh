#!/usr/bin/env bash
set -euo pipefail

REPO="n0facearia/n0face-opencode-fork"
APP="am"
BIN_DIR="$HOME/.am/bin"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/am"

# Check if we're already inside the repository
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd 2>/dev/null || true)"
if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/package.json" ] && grep -q '"name": "am"' "$SCRIPT_DIR/package.json" 2>/dev/null; then
  LOCAL_REPO="$SCRIPT_DIR"
elif [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/../package.json" ] && grep -q '"name": "am"' "$SCRIPT_DIR/../package.json" 2>/dev/null; then
  LOCAL_REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  LOCAL_REPO=""
fi

MUTED='\033[0;2m'
GREEN='\033[0;32m'
RED='\033[0;31m'
ORANGE='\033[38;5;214m'
NC='\033[0m'

# ─── Uninstall mode ──────────────────────────────────────────────────

UNINSTALL=0
if [ "${0:-}" = "--uninstall" ] || [ "${1:-}" = "--uninstall" ]; then
  UNINSTALL=1
fi

if [ "$UNINSTALL" = "1" ]; then
  echo ""
  echo "  ┌─ AM Uninstaller ────────────────────────────────────────┐"
  echo "  │                                                          │"
  echo "  │  Removes AM CLI, mode configs, and PATH entries          │"
  echo "  └──────────────────────────────────────────────────────────┘"
  echo ""

  local_path=$(command -v am 2>/dev/null || true)
  [ -n "$local_path" ] && rm -f "$local_path"
  rm -f "$HOME/.am/bin/am"
  rm -f "$HOME/.local/bin/am"

  CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/am"
  rm -rf "$CONFIG_DIR"

  for file in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.config/fish/config.fish"; do
    [ -f "$file" ] && sed -i '/# AM/d;/\.am\/bin/d' "$file"
  done

  echo "  ✅ AM removed"
  echo ""
  exit 0
fi

echo ""
echo "  ┌─ AM Installer ──────────────────────────────────────────┐"
echo "  │                                                          │"
echo "  │  Installs AM CLI + 11-mode agent system:                 │"
echo "  │  start, design, frontend, backend, database,              │"
echo "  │  cleanup, security, testing, devops, documentation, chat │"
echo "  └──────────────────────────────────────────────────────────┘"
echo ""

# ─── Build from source ───────────────────────────────────────────

if ! command -v git &>/dev/null; then
  echo -e "${RED}git is required to build AM from source.${NC}"
  echo -e "${RED}Install git (e.g., 'apt install git' or 'brew install git') and try again.${NC}"
  exit 1
fi
if ! command -v bun &>/dev/null; then
  echo -e "${RED}bun is required to build AM from source.${NC}"
  echo -e "${RED}Install bun (e.g., 'curl -fsSL https://bun.sh/install | bash') and try again.${NC}"
  exit 1
fi

git_version=$(git --version 2>/dev/null || echo "unknown")
bun_version=$(bun --version 2>/dev/null || echo "unknown")
echo -e "${MUTED}Building AM from source...${NC}"
echo -e "  git: $git_version"
echo -e "  bun: $bun_version"

BUILD_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t am-build)

# Use local repo if we're inside it
if [ -n "$LOCAL_REPO" ] && [ -d "$LOCAL_REPO/packages/opencode" ]; then
  echo -e "${MUTED}Using local repository...${NC}"
  rm -rf "$BUILD_DIR"
  BUILD_DIR="$LOCAL_REPO"
else
  # Clone with retry logic
  echo -e "${MUTED}Cloning repository...${NC}"
  clone_success=0
  for attempt in 1 2 3; do
    if [ "$attempt" -gt 1 ]; then
      echo -e "${MUTED}  Retry attempt $attempt/3...${NC}"
      sleep 2
    fi

    if [ -n "${GITHUB_TOKEN:-}" ] || [ -n "${GH_TOKEN:-}" ]; then
      token="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
      if GIT_TERMINAL_PROMPT=0 git clone --depth=1 "https://x-access-token:${token}@github.com/$REPO.git" "$BUILD_DIR"; then
        clone_success=1
        break
      fi
    fi

    if GIT_TERMINAL_PROMPT=0 git clone --depth=1 "https://github.com/$REPO.git" "$BUILD_DIR"; then
      clone_success=1
      break
    fi
  done

  if [ "$clone_success" -eq 0 ]; then
    echo -e "${RED}Failed to clone repository after 3 attempts.${NC}"
    echo -e "${RED}This could be due to:${NC}"
    echo -e "${MUTED}  - Network connectivity issues${NC}"
    echo -e "${MUTED}  - GitHub rate limiting (anonymous clones are limited)${NC}"
    echo ""
    echo -e "${MUTED}Or try manually:${NC}"
    echo -e "  git clone https://github.com/$REPO.git${NC}"
    echo -e "  cd n0face-opencode-fork${NC}"
    echo -e "  bun install${NC}"
    echo -e "  bun run --cwd packages/opencode build --single${NC}"
    echo ""
    rm -rf "$BUILD_DIR"
    exit 1
  fi
fi

echo -e "${MUTED}Installing dependencies...${NC}"
if ! bun install --cwd "$BUILD_DIR" --ignore-scripts 2>&1; then
  echo -e "${RED}Failed to install dependencies${NC}"
  rm -rf "$BUILD_DIR"; exit 1
fi

echo -e "${MUTED}Building binary (may take a few minutes)...${NC}"
if ! bun run --cwd "$BUILD_DIR/packages/opencode" build --single --skip-install 2>&1; then
  echo -e "${RED}Failed to build AM${NC}"
  echo -e "${RED}Check the error output above for details.${NC}"
  rm -rf "$BUILD_DIR"; exit 1
fi

BUILT=$(find "$BUILD_DIR/packages/opencode/dist" -name "am" -type f 2>/dev/null | head -1)
if [ -z "$BUILT" ] || [ ! -f "$BUILT" ]; then
  echo -e "${RED}Built binary not found in $BUILD_DIR/packages/opencode/dist${NC}"
  ls -la "$BUILD_DIR/packages/opencode/dist" 2>/dev/null || echo "Directory not found"
  rm -rf "$BUILD_DIR"; exit 1
fi

mkdir -p "$BIN_DIR" "$HOME/.local/bin"
cp "$BUILT" "$BIN_DIR/am"
chmod +x "$BIN_DIR/am"
cp "$BIN_DIR/am" "$HOME/.local/bin/am"
echo -e "  ${GREEN}✓${NC} Installed AM binary to $BIN_DIR/am"

# ── Install agent files from repository ────────────────────
if [ -d "$BUILD_DIR/.am/agent" ]; then
  mkdir -p "$CONFIG_DIR/agent"
  cp "$BUILD_DIR/.am/agent/"*.md "$CONFIG_DIR/agent/"
  echo -e "  ${GREEN}✓${NC} Installed agent mode files"
fi

# ── Install skills from repository ─────────────────────────
if [ -d "$BUILD_DIR/.agents/skills" ]; then
  mkdir -p "$CONFIG_DIR/skills"
  cp -r "$BUILD_DIR/.agents/skills/"* "$CONFIG_DIR/skills/"
  echo -e "  ${GREEN}✓${NC} Installed skills ($(find "$CONFIG_DIR/skills" -type f 2>/dev/null | wc -l) files)"
fi

# ── Install MCP servers (from .mcp.json) ───────────────────
if [ -f "$BUILD_DIR/.mcp.json" ] && command -v jq &>/dev/null; then
  MCP_MERGE=$(jq '.mcpServers | to_entries | map({key, value: {type: "local", command: [.value.command] + .value.args}}) | from_entries' "$BUILD_DIR/.mcp.json" 2>/dev/null || echo "")
  if [ -n "$MCP_MERGE" ]; then
    if [ -f "$CONFIG_DIR/am.jsonc" ]; then
      jq --argjson mcp "$MCP_MERGE" '.mcp = ((.mcp // {}) + $mcp)' "$CONFIG_DIR/am.jsonc" > "$CONFIG_DIR/am.jsonc.tmp" && mv "$CONFIG_DIR/am.jsonc.tmp" "$CONFIG_DIR/am.jsonc"
    else
      jq -n --argjson mcp "$MCP_MERGE" '{"$schema": "https://opencode.ai/config.json", mcp: $mcp}' > "$CONFIG_DIR/am.jsonc"
    fi
    echo -e "  ${GREEN}✓${NC} MCP servers added to am.jsonc"
  fi
fi

# Only clean up if we cloned (not if using local repo)
if [ "$BUILD_DIR" != "$LOCAL_REPO" ]; then
  rm -rf "$BUILD_DIR"
fi

# ─── Add to PATH ──────────────────────────────────────────────────

add_to_path() {
  local config_file="$1" line="$2"
  if ! grep -Fxq "$line" "$config_file" 2>/dev/null; then
    echo -e "\n# AM" >> "$config_file"
    echo "$line" >> "$config_file"
    echo -e "  ${MUTED}Added to \$PATH in ${NC}$config_file"
  fi
}

if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  case "${SHELL##*/}" in
    fish)
      fish -c "fish_add_path $BIN_DIR" 2>/dev/null || true
      if [ -f "$HOME/.config/fish/config.fish" ] && ! grep -q "fish_add_path $BIN_DIR" "$HOME/.config/fish/config.fish" 2>/dev/null; then
        if grep -q "opencode/bin" "$HOME/.config/fish/config.fish" 2>/dev/null; then
          sed -i "/opencode\/bin/i fish_add_path $BIN_DIR" "$HOME/.config/fish/config.fish"
        else
          echo -e "\n# AM" >> "$HOME/.config/fish/config.fish"
          echo "fish_add_path $BIN_DIR" >> "$HOME/.config/fish/config.fish"
        fi
        echo -e "  ${MUTED}Added to \$PATH in ${NC}$HOME/.config/fish/config.fish"
      fi
      ;;
    zsh)
      add_to_path "${ZDOTDIR:-$HOME}/.zshrc" "export PATH=\"$BIN_DIR:\$PATH\""
      export PATH="$BIN_DIR:$PATH"
      ;;
    bash)
      add_to_path "$HOME/.bashrc" "export PATH=\"$BIN_DIR:\$PATH\""
      export PATH="$BIN_DIR:$PATH"
      ;;
  esac
fi

# ─── Verify ───────────────────────────────────────────────────────

if "$BIN_DIR/am" --version >/dev/null 2>&1; then
  am_version=$("$BIN_DIR/am" --version 2>/dev/null)
  echo -e "  ${GREEN}✓${NC} Verified: ${am_version}"
else
  echo -e "  ${ORANGE}⚠${NC} Binary installed but smoke test failed"
fi

echo ""
echo "  ─────────────────────────────────────────────────────"
echo ""
echo "  ${GREEN}AM is ready.${NC}"
echo ""
echo "  Use it in any project:"
echo "    cd <project-dir>"
echo "    am"
echo ""
echo "  If am is not found, restart your shell or run:"
echo "    exec \$SHELL"
echo ""
echo "  Press Tab to cycle modes: start → design → frontend → backend → database"
echo "  More modes: cleanup → security → testing → devops → documentation → chat"
echo "  Slash commands: /modes  /btw  /chat  /new-project  /continue-project"
echo ""
