#!/usr/bin/env bash
set -e

BINARY_PREFIX="amcli"

if [ "${1:-}" = "uninstall" ]; then
  if [ -f "$HOME/.local/bin/am" ]; then
    rm "$HOME/.local/bin/am"
    echo "am uninstalled."
  else
    echo "am is not installed."
  fi
  exit 0
fi

detect_asset() {
  os=$(uname -s | tr '[:upper:]' '[:lower:]')
  arch=$(uname -m)

  case "$os" in
    linux) os="linux" ;;
    darwin) os="darwin" ;;
    *) echo "Your platform is not supported yet"; exit 1 ;;
  esac

  case "$arch" in
    x86_64) arch="x64" ;;
    arm64 | aarch64) arch="arm64" ;;
    *) echo "Your platform is not supported yet"; exit 1 ;;
  esac

  echo "${BINARY_PREFIX}-${os}-${arch}"
}

asset=$(detect_asset)
base_url="https://github.com/n0facearia/n0face-opencode-fork/releases/latest/download"

echo ""
echo "Downloading am for ${asset}..."
echo ""

mkdir -p "$HOME/.local/bin"
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

download() {
  if command -v curl &>/dev/null; then
    curl -fL --progress-bar -o "$1" "$2" 2>&1
  elif command -v wget &>/dev/null; then
    wget "$2" -O "$1" 2>&1
  else
    echo "Error: curl or wget is required."
    exit 1
  fi
}

# Try .tar.gz first, fall back to raw binary (CI produces both over time)
archive="${base_url}/${asset}.tar.gz"
raw="${base_url}/${asset}"
target="$TMPDIR/${asset}"

if download "$TMPDIR/${asset}.tar.gz" "$archive"; then
  tar -xzf "$TMPDIR/${asset}.tar.gz" -C "$TMPDIR"
  if [ -f "$TMPDIR/am" ]; then
    mv "$TMPDIR/am" "$HOME/.local/bin/am"
  else
    mv "$TMPDIR/${asset}" "$HOME/.local/bin/am"
  fi
elif download "$target" "$raw"; then
  mv "$target" "$HOME/.local/bin/am"
else
  echo ""
  echo "Error: Failed to download ${asset}.tar.gz or ${asset}."
  echo "Your platform may not have a build for this release."
  echo "See: https://github.com/n0facearia/n0face-opencode-fork/releases"
  exit 1
fi
chmod +x "$HOME/.local/bin/am"

echo ""
echo "Installation complete. Run: am"
echo ""
