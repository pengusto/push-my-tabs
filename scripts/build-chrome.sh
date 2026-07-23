#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

node layout.test.mjs
node api.test.mjs
node background.test.mjs
node i18n.test.mjs
node ui.test.mjs
node scripts/validate-release.mjs

version=$(node -p 'require("./manifest.json").version')
archive="dist/tabcompass-chrome-${version}.zip"
files=(
  manifest.json
  api.js background.js i18n.js layout.js options.js picker.js popup.js
  options.html popup.html styles.css
  assets/icons/icon-16.png assets/icons/icon-32.png assets/icons/icon-48.png assets/icons/icon-128.png
  assets/icons/browser-language.svg assets/icons/language.svg assets/icons/kurdistan-language.png
  _locales/*/messages.json
)

mkdir -p dist
rm -f "$archive"
zip -X -q "$archive" "${files[@]}"

expected=$(mktemp)
actual=$(mktemp)
trap 'rm -f "$expected" "$actual"' EXIT
printf '%s\n' "${files[@]}" | LC_ALL=C sort > "$expected"
unzip -Z1 "$archive" | LC_ALL=C sort > "$actual"
diff -u "$expected" "$actual"

echo "built $archive"
