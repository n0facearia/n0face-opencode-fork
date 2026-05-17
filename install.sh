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

  # Remove n0face binary from any location
  local_path=$(command -v n0face 2>/dev/null || true)
  [ -n "$local_path" ] && rm -f "$local_path"
  rm -f "$HOME/.n0face/bin/n0face"
  rm -f "$HOME/.local/bin/n0face"

  # Remove global configs
  CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/n0face"
  rm -rf "$CONFIG_DIR"

  # Remove PATH entries from shell configs
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
echo "  │  Installs n0face CLI + custom agent modes:               │"
echo "  │  design, cleanup, security                               │"
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

  local target="${os}-${arch}"
  local filename="${APP}-${target}.tar.gz"
  local release_url="https://github.com/$REPO/releases/latest/download/$filename"

  if curl -sfL -o /dev/null "$release_url" 2>/dev/null; then
    echo -e "${MUTED}Downloading n0face binary...${NC}"
    curl -# -L "$release_url" | tar -xz -C "$BIN_DIR" 2>/dev/null
    [ -f "$BIN_DIR/opencode" ] && mv "$BIN_DIR/opencode" "$BIN_DIR/n0face"
    echo -e "  ${GREEN}✓${NC} Installed n0face binary to $BIN_DIR/n0face"
    return 0
  fi

  # Fallback: build from source if git + bun are available
  if command -v git &>/dev/null && command -v bun &>/dev/null; then
    echo -e "${MUTED}Building n0face from source...${NC}"
    local build_dir
    build_dir=$(mktemp -d)
    git clone --depth=1 "https://github.com/$REPO.git" "$build_dir" 2>/dev/null
    if [ -d "$build_dir/packages/opencode" ]; then
      bun install --cwd "$build_dir" --ignore-scripts 2>/dev/null
      bun run --cwd "$build_dir/packages/opencode" build --single --skip-install --skip-embed-web-ui 2>/dev/null
      local dist_dir="$build_dir/packages/opencode/dist"
      local built
      built=$(find "$dist_dir" -name "opencode" -type f 2>/dev/null | head -1)
      if [ -n "$built" ]; then
        cp "$built" "$BIN_DIR/n0face"
        chmod +x "$BIN_DIR/n0face"
        echo -e "  ${GREEN}✓${NC} Built n0face binary from source"
        rm -rf "$build_dir"
        return 0
      fi
    fi
    rm -rf "$build_dir"
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
      ln -sf "$src/opencode" "$BIN_DIR/n0face"
    fi
  else
    npm install -g opencode-ai
    local src
    src=$(npm root -g 2>/dev/null || echo "")
    src="${src%/lib/node_modules}/bin"
    if [ -f "$src/opencode" ]; then
      ln -sf "$src/opencode" "$BIN_DIR/n0face"
    fi
  fi

  if [ -f "$BIN_DIR/n0face" ]; then
    echo -e "  ${GREEN}✓${NC} Installed n0face ($(readlink "$BIN_DIR/n0face"))"
  else
    if command -v opencode &>/dev/null; then
      ln -sf "$(which opencode)" "$BIN_DIR/n0face"
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
        # Insert before any existing opencode PATH entry so n0face takes priority
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
echo "  │  design, cleanup, and security modes                 │"
echo "  └──────────────────────────────────────────────────────┘"
echo ""

BASE="https://raw.githubusercontent.com/$REPO/main"
mkdir -p "$CONFIG_DIR/agent" "$CONFIG_DIR/command"

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

install_file ".n0face/design.mode.md"   "$CONFIG_DIR/design.mode.md"
install_file ".n0face/cleanup.mode.md"  "$CONFIG_DIR/cleanup.mode.md"
install_file ".n0face/security.mode.md" "$CONFIG_DIR/security.mode.md"
install_file ".n0face/agent/design.md"   "$CONFIG_DIR/agent/design.md"
install_file ".n0face/agent/cleanup.md"  "$CONFIG_DIR/agent/cleanup.md"
install_file ".n0face/agent/security.md" "$CONFIG_DIR/agent/security.md"
install_file ".n0face/command/new-project.md" "$CONFIG_DIR/command/new-project.md"
install_file ".n0face/command/import-md.md"   "$CONFIG_DIR/command/import-md.md"
install_file "TUTORIAL.md" "$CONFIG_DIR/TUTORIAL.md"

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
echo "  Press Tab to cycle modes: plan → build → design → cleanup → security"
echo "  Commands: /new-project, /import-md"
echo ""
