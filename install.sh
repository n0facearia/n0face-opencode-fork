#!/usr/bin/env bash
set -e

if [ "${1:-}" = "uninstall" ]; then
  if [ -f "$HOME/.local/bin/am" ]; then
    rm "$HOME/.local/bin/am"
    echo "am uninstalled."
  else
    echo "am is not installed."
  fi
  exit 0
fi

detect_binary() {
  os=$(uname -s | tr '[:upper:]' '[:lower:]')
  arch=$(uname -m)

  case "$os" in
    linux) os="linux" ;;
    darwin) os="macos" ;;
    *) echo "Your platform is not supported yet"; exit 1 ;;
  esac

  case "$arch" in
    x86_64) arch="x64" ;;
    arm64 | aarch64) arch="arm64" ;;
    *) echo "Your platform is not supported yet"; exit 1 ;;
  esac

  echo "am-${os}-${arch}"
}

binary=$(detect_binary)
url="https://github.com/n0facearia/n0face-opencode-fork/releases/latest/download/${binary}"

echo ""
echo "Downloading am for ${binary}..."
echo ""

mkdir -p "$HOME/.local/bin"

if command -v curl &>/dev/null; then
  curl -fsSL "$url" -o "$HOME/.local/bin/am"
elif command -v wget &>/dev/null; then
  wget -q "$url" -O "$HOME/.local/bin/am"
else
  echo "Error: curl or wget is required."
  exit 1
fi

chmod +x "$HOME/.local/bin/am"

echo ""
echo "Installation complete. Run: am"
echo ""
