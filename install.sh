#!/usr/bin/env bash
set -e

REPO="n0facearia/n0face-opencode-fork"
BRANCH="main"
BASE="https://raw.githubusercontent.com/$REPO/$BRANCH"

echo ""
echo "  ┌─ n0face's OpenCode Mode System ──────────────────────────┐"
echo "  │                                                          │"
echo "  │  Installs custom agent modes: design, cleanup, security  │"
echo "  │                                                          │"
echo "  └──────────────────────────────────────────────────────────┘"
echo ""

mkdir -p .n0face .n0face/agent .n0face/command

created=0
skipped=0

install_file() {
  local src="$1" dst="$2"
  if [ -f "$dst" ]; then
    echo "  ~ $dst already exists, skipping"
    skipped=$((skipped + 1))
  else
    curl -fsSL "$BASE/$src" -o "$dst"
    echo "  ✓ $dst"
    created=$((created + 1))
  fi
}

# Mode prompt files
install_file ".n0face/design.mode.md"   ".n0face/design.mode.md"
install_file ".n0face/cleanup.mode.md"  ".n0face/cleanup.mode.md"
install_file ".n0face/security.mode.md" ".n0face/security.mode.md"

# Agent config files (sourced from .opencode/agent/ on GitHub, placed in .n0face/agent/ locally)
install_file ".opencode/agent/design.md"   ".n0face/agent/design.md"
install_file ".opencode/agent/cleanup.md"  ".n0face/agent/cleanup.md"
install_file ".opencode/agent/security.md" ".n0face/agent/security.md"

# Slash commands (sourced from .opencode/command/ on GitHub)
install_file ".opencode/command/new-project.md" ".n0face/command/new-project.md"
install_file ".opencode/command/import-md.md"   ".n0face/command/import-md.md"

# Tutorial
install_file "TUTORIAL.md" "TUTORIAL.md"

echo ""
if [ "$created" -gt 0 ]; then
  echo "  ✅ Created $created file(s)"
fi
if [ "$skipped" -gt 0 ]; then
  echo "  ℹ️  Skipped $skipped existing file(s)"
fi
echo ""
if [ "$created" -gt 0 ]; then
  echo "  Next steps:"
    echo "    Run 'n0face' and press Tab to cycle modes:"
  echo "    plan → build → design → cleanup → security"
  echo ""
  echo "    Type '/new-project' to set up a new project"
  echo "    Type '/import-md' to import into an existing project"
  echo ""
fi
