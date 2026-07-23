# Push My Tabs

Layout-aware keyboard shortcuts for switching and moving tabs in Chrome. Firefox support follows from the same shared core.

See [CHANGELOG.md](CHANGELOG.md) for user-facing changes.

- [Privacy](PRIVACY.md)
- [Support](https://github.com/enis-uys/push-my-tabs/issues)

## Current status

The Chrome extension, release package, branding, store assets, and clean-profile browser QA are ready for release. The shared core and Firefox manifest exist, but Firefox-specific packaging and real-browser validation are still planned.

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
node i18n.test.mjs
node ui.test.mjs
jq empty manifest.json manifest.firefox.json
```

## Chrome release

Node.js 22, `zip`, and `unzip` are required. From a clean checkout, one command runs all checks and creates `dist/push-my-tabs-chrome-<version>.zip`:

```sh
./scripts/build-chrome.sh
```

Tagged releases and their matching Chrome archives are available on the [GitHub Releases page](https://github.com/enis-uys/push-my-tabs/releases).

The extension uses no host permissions, content scripts, accounts, analytics, advertising, or remote code.
