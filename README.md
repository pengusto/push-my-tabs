# TabCompass

Layout-aware keyboard shortcuts for switching and moving tabs in Chrome and Firefox.

## Current status

The shared Manifest V3 core, Chrome package, Firefox manifest, popup, options page, presets, and local-only settings are implemented. Store icons, final branding, and manual browser QA remain before publishing.

## Local Chrome test

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this directory.
4. Open `chrome://extensions/shortcuts` and assign any shortcut Chrome did not accept by default.

## Checks

```sh
node layout.test.mjs
node background.test.mjs
jq empty manifest.json manifest.firefox.json
```

The extension uses no host permissions, content scripts, accounts, analytics, advertising, or remote code.
