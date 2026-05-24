#!/usr/bin/env bash
set -euo pipefail

REPO="n0facearia/n0face-opencode-fork"
APP="n0face"
BIN_DIR="$HOME/.n0face/bin"
BUILD_DIR="${N0FACE_BUILD_DIR:-$HOME/.n0face/build}"

MUTED='\033[0;2m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "  ┌─ n0face Rebuild ──────────────────────────────────────┐"
echo "  │                                                          │"
echo "  │  Clones (or pulls) the latest source and builds          │"
echo "  │  the n0face binary from source.                          │"
echo "  │                                                          │"
echo "  │  Requires: git, bun                                      │"
echo "  └──────────────────────────────────────────────────────────┘"
echo ""

if ! command -v git &>/dev/null; then
  echo -e "${RED}Error: git is required${NC}"
  exit 1
fi
if ! command -v bun &>/dev/null; then
  echo -e "${RED}Error: bun is required${NC}"
  exit 1
fi

echo -e "${MUTED}Preparing build directory...${NC}"
mkdir -p "$(dirname "$BUILD_DIR")"

if [ -d "$BUILD_DIR" ]; then
  echo -e "${MUTED}Updating existing source...${NC}"
  git -C "$BUILD_DIR" fetch --tags origin
  git -C "$BUILD_DIR" checkout main 2>/dev/null || true
  git -C "$BUILD_DIR" pull --ff-only
else
  echo -e "${MUTED}Cloning repository...${NC}"
  git clone --depth=1 "https://github.com/$REPO.git" "$BUILD_DIR"
fi

echo -e "${MUTED}Installing dependencies...${NC}"
bun install --cwd "$BUILD_DIR" --ignore-scripts

echo -e "${MUTED}Building binary (this may take a few minutes)...${NC}"
bun run --cwd "$BUILD_DIR/packages/opencode" build --single --skip-install

echo -e "${MUTED}Installing n0face binary...${NC}"
mkdir -p "$BIN_DIR" "$HOME/.local/bin"

DIST_DIR="$BUILD_DIR/packages/opencode/dist"
BUILT=$(find "$DIST_DIR" -name "opencode" -type f 2>/dev/null | head -1)

if [ -z "$BUILT" ] || [ ! -f "$BUILT" ]; then
  echo -e "${RED}Error: built binary not found in $DIST_DIR${NC}"
  exit 1
fi

cp "$BUILT" "$BIN_DIR/$APP"
chmod +x "$BIN_DIR/$APP"
cp "$BIN_DIR/$APP" "$HOME/.local/bin/$APP"

echo -e "  ${GREEN}✓${NC} n0face rebuilt from source"
echo "  Binary: $BIN_DIR/$APP"
echo ""
echo "  Run: n0face"
echo ""
