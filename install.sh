#!/usr/bin/env bash
set -euo pipefail

REPO="n0facearia/n0face-opencode-fork"
APP="am"
BIN_DIR="$HOME/.am/bin"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/am"

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
    [ -f "$file" ] && sed -i '/# AM/d;/\.am\/bin/d;/opencode\/bin/d' "$file"
  done

  echo "  ✅ AM removed"
  echo ""
fi

if [ "$UNINSTALL" = "0" ]; then

echo ""
echo "  ┌─ AM Installer ──────────────────────────────────────────┐"
echo "  │                                                          │"
echo "  │  Installs AM CLI + 10-mode agent system:                 │"
echo "  │  manager, design, frontend, backend, database,           │"
echo "  │  cleanup, security, testing, devops, documentation       │"
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

  local target="${os}-${arch}"
  local filename="${APP}-${target}.tar.gz"
  local release_url="https://github.com/$REPO/releases/latest/download/$filename"

  if curl -sfL -o /dev/null "$release_url" 2>/dev/null; then
    echo -e "${MUTED}Downloading AM binary...${NC}"
    curl -# -L "$release_url" | tar -xz -C "$BIN_DIR" 2>/dev/null
    [ -f "$BIN_DIR/opencode" ] && mv "$BIN_DIR/opencode" "$BIN_DIR/am"
    cp "$BIN_DIR/am" "$HOME/.local/bin/am"
    echo -e "  ${GREEN}✓${NC} Installed AM binary to $BIN_DIR/am"
    return 0
  fi

  echo -e "${MUTED}Installing opencode-ai via npm (aliased as am)...${NC}"
  if ! command -v npm &>/dev/null && ! command -v bun &>/dev/null; then
    if command -v node &>/dev/null; then
      corepack enable 2>/dev/null || true
    fi
  fi

  if command -v bun &>/dev/null; then
    bun install -g opencode-ai
    local src
    src=$(bun pm bin 2>/dev/null || echo "")
    if [ -n "$src" ] && [ -f "$src/opencode" ]; then
      cp "$src/opencode" "$BIN_DIR/am"
    fi
  else
    npm install -g opencode-ai
    local src
    src=$(npm root -g 2>/dev/null || echo "")
    src="${src%/lib/node_modules}/bin"
    if [ -f "$src/opencode" ]; then
      cp "$src/opencode" "$BIN_DIR/am"
    fi
  fi

  if [ -f "$BIN_DIR/am" ]; then
    chmod +x "$BIN_DIR/am"
    cp "$BIN_DIR/am" "$HOME/.local/bin/am"
    echo -e "  ${GREEN}✓${NC} Installed AM"
  else
    if command -v opencode &>/dev/null; then
      cp "$(which opencode)" "$BIN_DIR/am"
      cp "$BIN_DIR/am" "$HOME/.local/bin/am"
      echo -e "  ${GREEN}✓${NC} AM aliased to opencode"
    else
      echo -e "${RED}Failed to install AM binary${NC}"
      exit 1
    fi
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
  code=$(curl -fsSL -w "%{http_code}" "$BASE/$src" -o "$dst" 2>/dev/null) || true
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

# ── Agent mode files (10 modes) ─────────────────────────────────
install_file ".am/agent/manager.md"       "$CONFIG_DIR/agent/manager.md"
install_file ".am/agent/design.md"        "$CONFIG_DIR/agent/design.md"
install_file ".am/agent/frontend.md"      "$CONFIG_DIR/agent/frontend.md"
install_file ".am/agent/backend.md"       "$CONFIG_DIR/agent/backend.md"
install_file ".am/agent/database.md"      "$CONFIG_DIR/agent/database.md"
install_file ".am/agent/cleanup.md"       "$CONFIG_DIR/agent/cleanup.md"
install_file ".am/agent/security.md"      "$CONFIG_DIR/agent/security.md"
install_file ".am/agent/testing.md"       "$CONFIG_DIR/agent/testing.md"
install_file ".am/agent/devops.md"        "$CONFIG_DIR/agent/devops.md"
install_file ".am/agent/documentation.md" "$CONFIG_DIR/agent/documentation.md"

# ── State files (one per mode, initialized as empty JSON) ───────
install_file ".am/state/manager.json"       "$CONFIG_DIR/state/manager.json"
install_file ".am/state/design.json"        "$CONFIG_DIR/state/design.json"
install_file ".am/state/frontend.json"      "$CONFIG_DIR/state/frontend.json"
install_file ".am/state/backend.json"       "$CONFIG_DIR/state/backend.json"
install_file ".am/state/database.json"      "$CONFIG_DIR/state/database.json"
install_file ".am/state/cleanup.json"       "$CONFIG_DIR/state/cleanup.json"
install_file ".am/state/security.json"      "$CONFIG_DIR/state/security.json"
install_file ".am/state/testing.json"       "$CONFIG_DIR/state/testing.json"
install_file ".am/state/devops.json"        "$CONFIG_DIR/state/devops.json"
install_file ".am/state/documentation.json" "$CONFIG_DIR/state/documentation.json"

# ── Project template files ───────────────────────────────────────
install_file ".am/project.md"   "$CONFIG_DIR/project.md"
install_file ".am/changelog.md" "$CONFIG_DIR/changelog.md"

# ── Slash commands ───────────────────────────────────────────────
install_file ".am/command/new-project.md" "$CONFIG_DIR/command/new-project.md"
install_file ".am/command/continue-project.md"   "$CONFIG_DIR/command/continue-project.md"

# ── Reference docs ───────────────────────────────────────────────
install_file "TUTORIAL.md" "$CONFIG_DIR/TUTORIAL.md"

# ── Legacy .mode.md files (kept for backwards compatibility) ─────
# These are the original 3-mode files from v0.1.0.
# They are still installed so existing users who reference them
# directly are not broken. The new system uses agent/*.md instead.
install_file ".am/design.mode.md"   "$CONFIG_DIR/design.mode.md"
install_file ".am/cleanup.mode.md"  "$CONFIG_DIR/cleanup.mode.md"
install_file ".am/security.mode.md" "$CONFIG_DIR/security.mode.md"

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
echo "  Press Tab to cycle modes: plan → build → design → frontend → backend"
echo "  More modes: database → cleanup → security → testing → devops → documentation"
echo "  Start: /new-project  |  Import existing project: /continue-project"
echo ""

fi
