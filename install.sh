#!/usr/bin/env bash
set -euo pipefail

REPO="n0facearia/n0face-opencode-fork"
APP="am"
BIN_DIR="$HOME/.am/bin"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/am"

# Check if we're already inside the repository
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd 2>/dev/null || true)"
if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/package.json" ] && grep -q '"name": "am"' "$SCRIPT_DIR/package.json" 2>/dev/null; then
  LOCAL_REPO="$SCRIPT_DIR"
elif [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/../package.json" ] && grep -q '"name": "am"' "$SCRIPT_DIR/../package.json" 2>/dev/null; then
  # Script is in repo root but we cd'd to script dir
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
fi

if [ "$UNINSTALL" = "0" ]; then

echo ""
echo "  ┌─ AM Installer ──────────────────────────────────────────┐"
echo "  │                                                          │"
echo "  │  Installs AM CLI + 11-mode agent system:                 │"
echo "  │  start, design, frontend, backend, database,              │"
echo "  │  cleanup, security, testing, devops, documentation, chat │"
echo "  └──────────────────────────────────────────────────────────┘"
echo ""

# ─── Detect OS/Arch ───────────────────────────────────────────────

raw_os=$(uname -s)
case "$raw_os" in Darwin*) os="darwin" ;; Linux*) os="linux" ;; *)
  echo -e "${RED}Unsupported OS: $raw_os${NC}"; exit 1 ;; esac
raw_arch=$(uname -m)
case "$raw_arch" in x86_64|amd64) arch="x64" ;; aarch64|arm64) arch="arm64" ;; *)
  echo -e "${RED}Unsupported arch: $raw_arch${NC}"; exit 1 ;; esac

# ─── Install Binary ───────────────────────────────────────────────

install_binary() {
  mkdir -p "$BIN_DIR"
  mkdir -p "$HOME/.local/bin"

  # Try prebuilt binary from GitHub releases
  # The build script creates tarballs named am-{os}-{arch}.tar.gz (package name)
  local target="${os}-${arch}"
  local pkg_name="am"
  local filename="${pkg_name}-${target}.tar.gz"
  local release_url="https://github.com/$REPO/releases/latest/download/$filename"

  if curl -sfL --connect-timeout 10 --max-time 30 -o /dev/null "$release_url" 2>/dev/null; then
    echo -e "${MUTED}Downloading AM binary...${NC}"
    curl -# -L --connect-timeout 10 --max-time 60 "$release_url" | tar -xz -C "$BIN_DIR" 2>/dev/null
    if [ -f "$BIN_DIR/am" ]; then
      echo -e "  ${MUTED}Binary already exists at $BIN_DIR/am${NC}"
    fi
    cp "$BIN_DIR/am" "$HOME/.local/bin/am"
    echo -e "  ${GREEN}✓${NC} Installed AM binary to $BIN_DIR/am"
    return 0
  fi

  # Fallback: try legacy binary name (am-{os}-{arch}.tar.gz)
  local legacy_filename="${APP}-${target}.tar.gz"
  local legacy_url="https://github.com/$REPO/releases/latest/download/$legacy_filename"
  if curl -sfL --connect-timeout 10 --max-time 30 -o /dev/null "$legacy_url" 2>/dev/null; then
    echo -e "${MUTED}Downloading AM binary (legacy naming)...${NC}"
    curl -# -L --connect-timeout 10 --max-time 60 "$legacy_url" | tar -xz -C "$BIN_DIR" 2>/dev/null
    [ -f "$BIN_DIR/am" ] && echo -e "  ${MUTED}Binary already exists${NC}"
    cp "$BIN_DIR/am" "$HOME/.local/bin/am"
    echo -e "  ${GREEN}✓${NC} Installed AM binary to $BIN_DIR/am"
    return 0
  fi

  # Check prerequisites for building from source
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

  local BUILD_DIR
  BUILD_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t am-build)

  # Use local repo if we're inside it
  if [ -n "$LOCAL_REPO" ] && [ -d "$LOCAL_REPO/packages/opencode" ]; then
    echo -e "${MUTED}Using local repository...${NC}"
    rm -rf "$BUILD_DIR"
    BUILD_DIR="$LOCAL_REPO"
  else
    # Clone with retry logic
    echo -e "${MUTED}Cloning repository...${NC}"
    local clone_success=0
    for attempt in 1 2 3; do
      if [ "$attempt" -gt 1 ]; then
        echo -e "${MUTED}  Retry attempt $attempt/3...${NC}"
        sleep 2
      fi

      # Try with GITHUB_TOKEN first if available
      if [ -n "${GITHUB_TOKEN:-}" ] || [ -n "${GH_TOKEN:-}" ]; then
        local token="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
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
      echo -e "${MUTED}  - The repository being temporarily unavailable${NC}"
      echo ""
      echo -e "${MUTED}To retry with authentication (bypasses rate limits), set:${NC}"
      echo -e "  export GITHUB_TOKEN=ghp_...${NC}"
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

  local BUILT
  BUILT=$(find "$BUILD_DIR/packages/opencode/dist" -name "am" -type f 2>/dev/null | head -1)
  if [ -z "$BUILT" ] || [ ! -f "$BUILT" ]; then
    echo -e "${RED}Built binary not found in $BUILD_DIR/packages/opencode/dist${NC}"
    echo -e "${RED}Build output directory contents:${NC}"
    ls -la "$BUILD_DIR/packages/opencode/dist" 2>/dev/null || echo "Directory not found"
    rm -rf "$BUILD_DIR"; exit 1
  fi

  cp "$BUILT" "$BIN_DIR/am"
  chmod +x "$BIN_DIR/am"
  cp "$BIN_DIR/am" "$HOME/.local/bin/am"

  # ── Install skills from repository ─────────────────────
  if [ -d "$BUILD_DIR/.am/skills" ]; then
    local SKILLS_DIR="$CONFIG_DIR/skills"
    mkdir -p "$SKILLS_DIR"
    cp -r "$BUILD_DIR/.am/skills/"* "$SKILLS_DIR/"
    echo -e "  ${GREEN}✓${NC} Installed skills ($(find "$SKILLS_DIR" -type f | wc -l) files)"
  fi

  # Only clean up if we cloned (not if using local repo)
  if [ "$BUILD_DIR" != "$LOCAL_REPO" ]; then
    rm -rf "$BUILD_DIR"
  fi

  echo -e "  ${GREEN}✓${NC} Installed AM binary to $BIN_DIR/am"

  # Verify the binary works
  if "$BIN_DIR/am" --version >/dev/null 2>&1; then
    local am_version
    am_version=$("$BIN_DIR/am" --version 2>/dev/null)
    echo -e "  ${GREEN}✓${NC} Verified: ${am_version}"
  else
    echo -e "  ${ORANGE}⚠${NC} Binary installed but smoke test failed"
  fi
}

install_binary

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

# ─── Install Mode Configs (Global) ────────────────────────────────

echo ""
echo "  ┌─ Installing Mode Configs ──────────────────────────┐"
echo "  │                                                      │"
echo "  │  10 agent modes + state files + project templates    │"
echo "  └──────────────────────────────────────────────────────┘"
echo ""

BASE="https://raw.githubusercontent.com/$REPO/main"
created=0; skipped=0
install_file() {
  local src="$1" dst="$2"
  if [ -f "$dst" ]; then
    echo "  ~ ${dst#$CONFIG_DIR/} already exists, skipping"
    skipped=$((skipped + 1)); return 0
  fi
  local code
  code=$(curl -fsSL --connect-timeout 10 --max-time 30 -w "%{http_code}" "$BASE/$src" -o "$dst" 2>/dev/null) || true
  if [ "$code" = "200" ]; then
    echo "  ✓ ${dst#$CONFIG_DIR/}"
    created=$((created + 1))
  else
    rm -f "$dst"; echo "  ✗ $src not found, skipping"
  fi
}

# ── Create required subdirectories ──────────────────────────────
mkdir -p "$CONFIG_DIR/agent"
mkdir -p "$CONFIG_DIR/command"
mkdir -p "$CONFIG_DIR/state"

# ── Agent mode files (11 modes) ─────────────────────────────────
install_file ".am/agent/start.md"        "$CONFIG_DIR/agent/start.md"
install_file ".am/agent/design.md"        "$CONFIG_DIR/agent/design.md"
install_file ".am/agent/frontend.md"      "$CONFIG_DIR/agent/frontend.md"
install_file ".am/agent/backend.md"       "$CONFIG_DIR/agent/backend.md"
install_file ".am/agent/database.md"      "$CONFIG_DIR/agent/database.md"
install_file ".am/agent/cleanup.md"       "$CONFIG_DIR/agent/cleanup.md"
install_file ".am/agent/security.md"      "$CONFIG_DIR/agent/security.md"
install_file ".am/agent/testing.md"       "$CONFIG_DIR/agent/testing.md"
install_file ".am/agent/devops.md"        "$CONFIG_DIR/agent/devops.md"
install_file ".am/agent/documentation.md" "$CONFIG_DIR/agent/documentation.md"
install_file ".am/agent/chat.md"          "$CONFIG_DIR/agent/chat.md"

# ── State files (one per mode, initialized as empty JSON) ───────
install_file ".am/state/start.json"        "$CONFIG_DIR/state/start.json"
install_file ".am/state/design.json"        "$CONFIG_DIR/state/design.json"
install_file ".am/state/frontend.json"      "$CONFIG_DIR/state/frontend.json"
install_file ".am/state/backend.json"       "$CONFIG_DIR/state/backend.json"
install_file ".am/state/database.json"      "$CONFIG_DIR/state/database.json"
install_file ".am/state/cleanup.json"       "$CONFIG_DIR/state/cleanup.json"
install_file ".am/state/security.json"      "$CONFIG_DIR/state/security.json"
install_file ".am/state/testing.json"       "$CONFIG_DIR/state/testing.json"
install_file ".am/state/devops.json"        "$CONFIG_DIR/state/devops.json"
install_file ".am/state/documentation.json" "$CONFIG_DIR/state/documentation.json"
install_file ".am/state/chat.json"          "$CONFIG_DIR/state/chat.json"

# ── Project template files ───────────────────────────────────────
install_file ".am/project.md"   "$CONFIG_DIR/project.md"
install_file ".am/changelog.md" "$CONFIG_DIR/changelog.md"

# ── Shared reference files ──────────────────────────────────────
install_file ".am/CODE-QUALITY-RULES.md"    "$CONFIG_DIR/CODE-QUALITY-RULES.md"
install_file ".am/CHANGELOG-FORMAT.md"      "$CONFIG_DIR/CHANGELOG-FORMAT.md"
install_file ".am/PROJECT-STATE-RULES.md"   "$CONFIG_DIR/PROJECT-STATE-RULES.md"
install_file ".am/LEARNING-LAYER-FORMAT.md" "$CONFIG_DIR/LEARNING-LAYER-FORMAT.md"

# ── Slash commands ───────────────────────────────────────────────
install_file ".am/command/new-project.md" "$CONFIG_DIR/command/new-project.md"
install_file ".am/command/continue-project.md"   "$CONFIG_DIR/command/continue-project.md"
install_file ".am/command/chat.md"        "$CONFIG_DIR/command/chat.md"
install_file ".am/command/btw.md"         "$CONFIG_DIR/command/btw.md"

# ── Reference docs ───────────────────────────────────────────────
install_file "TUTORIAL.md" "$CONFIG_DIR/TUTORIAL.md"

# ── Legacy .mode.md files (kept for backwards compatibility) ─────
# These are the original 3-mode files from v0.1.0.
# They are still installed so existing users who reference them
# directly are not broken. The new system uses agent/*.md instead.
install_file ".am/design.mode.md"   "$CONFIG_DIR/design.mode.md"
install_file ".am/cleanup.mode.md"  "$CONFIG_DIR/cleanup.mode.md"
install_file ".am/security.mode.md" "$CONFIG_DIR/security.mode.md"

# ── Skills ───────────────────────────────────────────────────────
mkdir -p "$CONFIG_DIR/skills/design-taste-frontend"
install_file ".agents/skills/design-taste-frontend/SKILL.md" "$CONFIG_DIR/skills/design-taste-frontend/SKILL.md"

# ── MCP servers (merge into am.jsonc) ────────────────────────────
MCP_RAW=$(curl -fsSL --connect-timeout 10 --max-time 30 "$BASE/.mcp.json" 2>/dev/null || echo "")
if [ -n "$MCP_RAW" ]; then
  MCP_MERGE=$(echo "$MCP_RAW" | jq '.mcpServers | to_entries | map({key, value: {type: "local", command: [.value.command] + .value.args}}) | from_entries' 2>/dev/null || echo "")
  if [ -n "$MCP_MERGE" ]; then
    if [ -f "$CONFIG_DIR/am.jsonc" ]; then
      jq --argjson mcp "$MCP_MERGE" '.mcp = ((.mcp // {}) + $mcp)' "$CONFIG_DIR/am.jsonc" > "$CONFIG_DIR/am.jsonc.tmp" && mv "$CONFIG_DIR/am.jsonc.tmp" "$CONFIG_DIR/am.jsonc"
    else
      jq -n --argjson mcp "$MCP_MERGE" '{"$schema": "https://opencode.ai/config.json", mcp: $mcp}' > "$CONFIG_DIR/am.jsonc"
    fi
    echo "  ✓ MCP servers added to am.jsonc"
  fi
fi

# ─── Summary ──────────────────────────────────────────────────────

echo ""
echo "  ─────────────────────────────────────────────────────"
echo ""
[ "$created" -gt 0 ] && echo "  ✅ Created $created file(s) in $CONFIG_DIR"
[ "$skipped" -gt 0 ] && echo "  ℹ️  Skipped $skipped existing file(s)"
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

fi
