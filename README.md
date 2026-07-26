# Push My Tabs

Layout-aware keyboard shortcuts for switching and moving tabs in Chrome and Firefox from one shared core.

See [CHANGELOG.md](CHANGELOG.md) for user-facing changes.

- [Privacy](PRIVACY.md)
- [Support](https://github.com/pengusto/push-my-tabs/issues)
- [Website](https://pengusto.github.io/push-my-tabs/)

## Current status

Chrome and Firefox release packages share the same tested source. Firefox 142 or newer uses the browser's exact vertical-tabs setting and lets users edit supported command shortcuts directly in the settings page.

## Languages

Chrome and Firefox automatically select the extension language from the browser UI locale. The settings page also offers a manual language override. Push My Tabs includes English, German, Spanish, French, Brazilian Portuguese, Italian, Polish, Turkish, Japanese, Simplified Chinese, Arabic, Russian, Ukrainian, Kurdish (Kurmanji), and Dari Persian. Unsupported browser locales fall back to English.

## Local Chrome test

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this directory.
4. Open `chrome://extensions/shortcuts` and assign any shortcut Chrome did not accept by default.

## Checks

```sh
node layout.test.mjs
node api.test.mjs
node background.test.mjs
node firefox.test.mjs
node i18n.test.mjs
node ui.test.mjs
jq empty manifest.json manifest.firefox.json
```

## Chrome release

Node.js 22, `zip`, and `unzip` are required. From a clean checkout, one command runs all checks and creates `dist/push-my-tabs-chrome-<version>.zip`:

```sh
./scripts/build-chrome.sh
```

## Firefox release

Firefox 142 or newer, Node.js 22, `npx`, `zip`, and `unzip` are required. The build runs pinned Mozilla `web-ext` lint. The Firefox package requests only `storage` and `browserSettings`; it declares that no data is collected or transmitted.

```sh
./scripts/build-firefox.sh
```

Tagged releases and their matching Chrome and Firefox archives are available on the [GitHub Releases page](https://github.com/pengusto/push-my-tabs/releases).

The extension uses no host permissions, content scripts, accounts, analytics, advertising, or remote code. Chrome's `activeTab` permission temporarily exposes only the current tab after a shortcut or popup action, allowing local geometry profiles for its origin or exact path. Firefox does not request that permission or read page data.
