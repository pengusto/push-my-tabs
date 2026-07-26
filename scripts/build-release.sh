#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

browser=${1:?browser required}
case "$browser" in
  chrome) manifest=manifest.json ;;
  firefox) manifest=manifest.firefox.json ;;
  *) echo "unsupported browser: $browser" >&2; exit 2 ;;
esac

node layout.test.mjs
node api.test.mjs
node background.test.mjs
node firefox.test.mjs
node i18n.test.mjs
node ui.test.mjs
node scripts/validate-release.mjs

version=$(node -p "require('./$manifest').version")
repo_root=$PWD
archive_rel="dist/push-my-tabs-${browser}-${version}.zip"
archive="$repo_root/$archive_rel"
files=(
  api.js background.js i18n.js layout.js options.js picker.js popup.js
  options.html popup.html styles.css
  assets/icons/icon-16.png assets/icons/icon-32.png assets/icons/icon-48.png assets/icons/icon-128.png
  assets/icons/browser-language.svg assets/icons/language.svg assets/icons/kurdistan-language.png
  _locales/*/messages.json
)

mkdir -p "$repo_root/dist"
rm -f "$archive"

stage=$(mktemp -d)
expected=$(mktemp)
actual=$(mktemp)
trap 'rm -rf "$stage"; rm -f "$expected" "$actual"' EXIT
cp "$manifest" "$stage/manifest.json"
touch -t 200001010000 "$stage/manifest.json"
for file in "${files[@]}"; do
  mkdir -p "$stage/$(dirname "$file")"
  cp "$file" "$stage/$file"
  touch -t 200001010000 "$stage/$file"
done
if [[ "$browser" == firefox ]]; then
  npx --yes web-ext@10.5.0 lint --source-dir "$stage" --warnings-as-errors
fi
(cd "$stage" && zip -X -q "$archive" manifest.json "${files[@]}")

printf '%s\n' manifest.json "${files[@]}" | LC_ALL=C sort > "$expected"
unzip -Z1 "$archive" | LC_ALL=C sort > "$actual"
diff -u "$expected" "$actual"

echo "built $archive_rel"
