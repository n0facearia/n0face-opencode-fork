#!/usr/bin/env bash

set -euo pipefail

REPO="n0facearia/n0face-opencode-fork"
BRANCH="main"
APP="n0face"
BIN_DIR="$HOME/.n0face/bin"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/n0face"

MUTED='\033[0;2m'
GREEN='\033[0;32m'
RED='\033[0;31m'
ORANGE='\033[38;5;214m'
NC='\033[0m'

echo ""
echo "  ┌─ n0face Installer ─────────────────────────────────────┐"
echo "  │                                                          │"
echo "  │  Installs the n0face CLI + custom agent modes:           │"
echo "  │  design, cleanup, security                               │"
echo "  │                                                          │"
echo "  └──────────────────────────────────────────────────────────┘"
echo ""

# ─── Detect OS/Arch ───────────────────────────────────────────────

raw_os=$(uname -s)
case "$raw_os" in
  Darwin*) os="darwin" ;;
  Linux*)  os="linux" ;;
  *)       echo -e "${RED}Unsupported OS: $raw_os${NC}"; exit 1 ;;
esac

raw_arch=$(uname -m)
case "$raw_arch" in
  x86_64|amd64) arch="x64" ;;
  aarch64|arm64) arch="arm64" ;;
  *) echo -e "${RED}Unsupported arch: $raw_arch${NC}"; exit 1 ;;
esac

# ─── Install Binary ───────────────────────────────────────────────

install_binary() {
  mkdir -p "$BIN_DIR"

  local target="${os}-${arch}"
  local filename="${APP}-${target}.tar.gz"
  local release_url="https://github.com/$REPO/releases/latest/download/$filename"

  echo -e "${MUTED}Looking for pre-built binary...${NC}"
  if curl -sfL -o /dev/null "$release_url" 2>/dev/null; then
    echo -e "${MUTED}Downloading n0face binary...${NC}"
    curl -# -L "$release_url" | tar -xz -C "$BIN_DIR" 2>/dev/null
    if [ -f "$BIN_DIR/opencode" ]; then
      mv "$BIN_DIR/opencode" "$BIN_DIR/n0face"
    fi
    echo -e "  ${GREEN}✓${NC} Installed n0face binary to $BIN_DIR/n0face"
    return 0
  fi

  echo -e "${MUTED}No pre-built binary found. Building from source...${NC}"

  if ! command -v bun &>/dev/null; then
    echo -e "${MUTED}Installing Bun...${NC}"
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
    if ! command -v bun &>/dev/null; then
      echo -e "${RED}Failed to install Bun. Please install manually: https://bun.sh${NC}"
      exit 1
    fi
  fi

  local tmp_dir
  tmp_dir=$(mktemp -d)
  trap "rm -rf '$tmp_dir'" EXIT

  echo -e "${MUTED}Cloning repository...${NC}"
  git clone --depth 1 --branch "$BRANCH" "https://github.com/$REPO.git" "$tmp_dir/repo" 2>/dev/null

  echo -e "${MUTED}Building n0face (this may take a minute)...${NC}"
  (cd "$tmp_dir/repo/packages/opencode" && bun install --silent 2>/dev/null && bun run build 2>/dev/null)

  local built
  built=$(find "$tmp_dir/repo/packages/opencode/dist" -name "opencode" -type f 2>/dev/null | head -1)
  if [ -z "$built" ]; then
    echo -e "${RED}Build failed. Try installing manually:${NC}"
    echo "  git clone https://github.com/$REPO.git"
    echo "  cd $REPO/packages/opencode && bun install && bun run build"
    exit 1
  fi

  cp "$built" "$BIN_DIR/n0face"
  chmod 755 "$BIN_DIR/n0face"
  rm -rf "$tmp_dir"
  trap - EXIT
  echo -e "  ${GREEN}✓${NC} Built and installed n0face binary to $BIN_DIR/n0face"
}

if command -v n0face &>/dev/null; then
  echo -e "  ${ORANGE}~${NC} n0face already installed at $(which n0face)"
else
  install_binary
fi

# ─── Add to PATH ──────────────────────────────────────────────────

add_to_path() {
  local config_file="$1"
  local line="$2"
  if ! grep -Fxq "$line" "$config_file" 2>/dev/null; then
    echo -e "\n# n0face" >> "$config_file"
    echo "$line" >> "$config_file"
    echo -e "  ${MUTED}Added to \$PATH in ${NC}$config_file"
  fi
}

if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  case "${SHELL##*/}" in
    fish)
      add_to_path "$HOME/.config/fish/config.fish" "fish_add_path $BIN_DIR"
      ;;
    zsh)
      add_to_path "${ZDOTDIR:-$HOME}/.zshrc" "export PATH=\"$BIN_DIR:\$PATH\""
      ;;
    bash)
      add_to_path "$HOME/.bashrc" "export PATH=\"$BIN_DIR:\$PATH\""
      ;;
  esac
  export PATH="$BIN_DIR:$PATH"
  echo -e "  ${GREEN}✓${NC} Added $BIN_DIR to PATH"
fi

# ─── Install Mode Configs (Global) ────────────────────────────────

echo ""
echo "  ┌─ Installing Mode Configs ──────────────────────────┐"
echo "  │                                                      │"
echo "  │  design, cleanup, and security modes                 │"
echo "  │                                                      │"
echo "  └──────────────────────────────────────────────────────┘"
echo ""

BASE="https://raw.githubusercontent.com/$REPO/$BRANCH"
mkdir -p "$CONFIG_DIR/agent" "$CONFIG_DIR/command"

created=0
skipped=0

install_file() {
  local src="$1" dst="$2"
  if [ -f "$dst" ]; then
    echo "  ~ $dst already exists, skipping"
    skipped=$((skipped + 1))
    return 0
  fi
  local code
  code=$(curl -fsSL -w "%{http_code}" "$BASE/$src" -o "$dst" 2>/dev/null) || true
  if [ "$code" = "200" ]; then
    echo "  ✓ ${dst#$CONFIG_DIR/}"
    created=$((created + 1))
  else
    rm -f "$dst"
    echo "  ✗ $src not found on remote, skipping"
  fi
}

# Mode prompts
install_file ".n0face/design.mode.md"   "$CONFIG_DIR/design.mode.md"
install_file ".n0face/cleanup.mode.md"  "$CONFIG_DIR/cleanup.mode.md"
install_file ".n0face/security.mode.md" "$CONFIG_DIR/security.mode.md"

# Agent configs
install_file ".n0face/agent/design.md"   "$CONFIG_DIR/agent/design.md"
install_file ".n0face/agent/cleanup.md"  "$CONFIG_DIR/agent/cleanup.md"
install_file ".n0face/agent/security.md" "$CONFIG_DIR/agent/security.md"

# Commands
install_file ".n0face/command/new-project.md" "$CONFIG_DIR/command/new-project.md"
install_file ".n0face/command/import-md.md"   "$CONFIG_DIR/command/import-md.md"

# Tutorial
install_file "TUTORIAL.md" "$CONFIG_DIR/TUTORIAL.md"

# ─── Summary ──────────────────────────────────────────────────────

echo ""
echo "  ─────────────────────────────────────────────────────"
echo ""
if [ "$created" -gt 0 ]; then
  echo "  ✅ Created $created file(s) in $CONFIG_DIR"
fi
if [ "$skipped" -gt 0 ]; then
  echo "  ℹ️  Skipped $skipped existing file(s)"
fi
echo ""
echo "  ${GREEN}n0face is ready!${NC}"
echo ""
echo "  Use it in any project:"
echo "    cd <project-dir>"
echo "    n0face"
echo ""
echo "  Press Tab to cycle modes: plan → build → design → cleanup → security"
echo "  Commands: /new-project, /import-md"
echo ""
