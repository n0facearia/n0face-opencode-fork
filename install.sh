#!/usr/bin/env bash
set -euo pipefail

REPO="n0facearia/n0face-opencode-fork"
APP="n0face"
BIN_DIR="$HOME/.n0face/bin"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/n0face"

MUTED='\033[0;2m'
GREEN='\033[0;32m'
RED='\033[0;31m'
ORANGE='\033[38;5;214m'
NC='\033[0m'

# ─── Uninstall mode ──────────────────────────────────────────────────

if [ "${0:-}" = "--uninstall" ] || [ "${1:-}" = "--uninstall" ]; then
  echo ""
  echo "  ┌─ n0face Uninstaller ───────────────────────────────────┐"
  echo "  │                                                          │"
  echo "  │  Removes n0face CLI, mode configs, and PATH entries      │"
  echo "  └──────────────────────────────────────────────────────────┘"
  echo ""

  local_path=$(command -v n0face 2>/dev/null || true)
  [ -n "$local_path" ] && rm -f "$local_path"
  rm -f "$HOME/.n0face/bin/n0face"
  rm -f "$HOME/.local/bin/n0face"

  CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/n0face"
  rm -rf "$CONFIG_DIR"

  for file in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.config/fish/config.fish"; do
    [ -f "$file" ] && sed -i '/# n0face/d;/n0face\/bin/d;/opencode\/bin/d' "$file"
  done

  echo "  ✅ n0face removed"
  echo ""
  exit 0
fi

echo ""
echo "  ┌─ n0face Installer ─────────────────────────────────────┐"
echo "  │                                                          │"
echo "  │  Installs n0face CLI + 10-mode agent system:             │"
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
    echo -e "${MUTED}Downloading n0face binary...${NC}"
    curl -# -L "$release_url" | tar -xz -C "$BIN_DIR" 2>/dev/null
    [ -f "$BIN_DIR/opencode" ] && mv "$BIN_DIR/opencode" "$BIN_DIR/n0face"
    cp "$BIN_DIR/n0face" "$HOME/.local/bin/n0face"
    echo -e "  ${GREEN}✓${NC} Installed n0face binary to $BIN_DIR/n0face"
    return 0
  fi

  echo -e "${MUTED}Installing opencode-ai via npm (aliased as n0face)...${NC}"
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
      cp "$src/opencode" "$BIN_DIR/n0face"
    fi
  else
    npm install -g opencode-ai
    local src
    src=$(npm root -g 2>/dev/null || echo "")
    src="${src%/lib/node_modules}/bin"
    if [ -f "$src/opencode" ]; then
      cp "$src/opencode" "$BIN_DIR/n0face"
    fi
  fi

  if [ -f "$BIN_DIR/n0face" ]; then
    chmod +x "$BIN_DIR/n0face"
    cp "$BIN_DIR/n0face" "$HOME/.local/bin/n0face"
    echo -e "  ${GREEN}✓${NC} Installed n0face"
  else
    if command -v opencode &>/dev/null; then
      cp "$(which opencode)" "$BIN_DIR/n0face"
      cp "$BIN_DIR/n0face" "$HOME/.local/bin/n0face"
      echo -e "  ${GREEN}✓${NC} n0face aliased to opencode"
    else
      echo -e "${RED}Failed to install n0face binary${NC}"
      exit 1
    fi
  fi
}

install_binary

# ─── Add to PATH ──────────────────────────────────────────────────

add_to_path() {
  local config_file="$1" line="$2"
  if ! grep -Fxq "$line" "$config_file" 2>/dev/null; then
    echo -e "\n# n0face" >> "$config_file"
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
          echo -e "\n# n0face" >> "$HOME/.config/fish/config.fish"
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
install_file ".n0face/agent/manager.md"       "$CONFIG_DIR/agent/manager.md"
install_file ".n0face/agent/design.md"        "$CONFIG_DIR/agent/design.md"
install_file ".n0face/agent/frontend.md"      "$CONFIG_DIR/agent/frontend.md"
install_file ".n0face/agent/backend.md"       "$CONFIG_DIR/agent/backend.md"
install_file ".n0face/agent/database.md"      "$CONFIG_DIR/agent/database.md"
install_file ".n0face/agent/cleanup.md"       "$CONFIG_DIR/agent/cleanup.md"
install_file ".n0face/agent/security.md"      "$CONFIG_DIR/agent/security.md"
install_file ".n0face/agent/testing.md"       "$CONFIG_DIR/agent/testing.md"
install_file ".n0face/agent/devops.md"        "$CONFIG_DIR/agent/devops.md"
install_file ".n0face/agent/documentation.md" "$CONFIG_DIR/agent/documentation.md"

# ── State files (one per mode, initialized as empty JSON) ───────
install_file ".n0face/state/manager.json"       "$CONFIG_DIR/state/manager.json"
install_file ".n0face/state/design.json"        "$CONFIG_DIR/state/design.json"
install_file ".n0face/state/frontend.json"      "$CONFIG_DIR/state/frontend.json"
install_file ".n0face/state/backend.json"       "$CONFIG_DIR/state/backend.json"
install_file ".n0face/state/database.json"      "$CONFIG_DIR/state/database.json"
install_file ".n0face/state/cleanup.json"       "$CONFIG_DIR/state/cleanup.json"
install_file ".n0face/state/security.json"      "$CONFIG_DIR/state/security.json"
install_file ".n0face/state/testing.json"       "$CONFIG_DIR/state/testing.json"
install_file ".n0face/state/devops.json"        "$CONFIG_DIR/state/devops.json"
install_file ".n0face/state/documentation.json" "$CONFIG_DIR/state/documentation.json"

# ── Project template files ───────────────────────────────────────
install_file ".n0face/project.md"   "$CONFIG_DIR/project.md"
install_file ".n0face/changelog.md" "$CONFIG_DIR/changelog.md"

# ── Slash commands ───────────────────────────────────────────────
install_file ".n0face/command/new-project.md" "$CONFIG_DIR/command/new-project.md"
install_file ".n0face/command/import-md.md"   "$CONFIG_DIR/command/import-md.md"

# ── Reference docs ───────────────────────────────────────────────
install_file "TUTORIAL.md" "$CONFIG_DIR/TUTORIAL.md"

# ── Legacy .mode.md files (kept for backwards compatibility) ─────
# These are the original 3-mode files from v0.1.0.
# They are still installed so existing users who reference them
# directly are not broken. The new system uses agent/*.md instead.
install_file ".n0face/design.mode.md"   "$CONFIG_DIR/design.mode.md"
install_file ".n0face/cleanup.mode.md"  "$CONFIG_DIR/cleanup.mode.md"
install_file ".n0face/security.mode.md" "$CONFIG_DIR/security.mode.md"

# ─── Summary ──────────────────────────────────────────────────────

echo ""
echo "  ─────────────────────────────────────────────────────"
echo ""
[ "$created" -gt 0 ] && echo "  ✅ Created $created file(s) in $CONFIG_DIR"
[ "$skipped" -gt 0 ] && echo "  ℹ️  Skipped $skipped existing file(s)"
echo ""
echo "  ${GREEN}n0face is ready!${NC}"
echo ""
echo "  Use it in any project:"
echo "    cd <project-dir>"
echo "    n0face"
echo ""
echo "  If n0face is not found, restart your shell or run:"
echo "    exec $SHELL"
echo ""
echo "  Press Tab to cycle modes: plan → build → design → frontend → backend"
echo "  More modes: database → cleanup → security → testing → devops → documentation"
echo "  Run /new-project to start, or /import-md for an existing project"
echo ""
