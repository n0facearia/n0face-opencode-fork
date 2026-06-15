#!/usr/bin/env bash
set -e

PACKAGE_NAME="amcli"

echo ""
echo "Installing AM (amcli)..."
echo ""

if command -v npm &>/dev/null; then
  npm install -g "$PACKAGE_NAME"
elif command -v bun &>/dev/null; then
  bun install -g "$PACKAGE_NAME"
else
  echo "Error: npm or bun is required."
  echo "Install Node.js from https://nodejs.org or Bun from https://bun.sh"
  exit 1
fi

echo ""
echo "AM installed. Run: am"
echo ""
