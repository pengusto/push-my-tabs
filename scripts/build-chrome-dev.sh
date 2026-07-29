#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

./scripts/build-chrome.sh
version=$(node -p "require('./manifest.json').version")
dev_dir="$PWD/dist/chrome-dev"

rm -rf "$dev_dir"
mkdir -p "$dev_dir"
unzip -q "dist/push-my-tabs-chrome-$version.zip" -d "$dev_dir"

echo "updated dist/chrome-dev"
