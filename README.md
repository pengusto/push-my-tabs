<table>
  <tr>
    <td width="184" align="center">
      <img src="docs/assets/molebyte-pixel.gif" alt="Molebyte waves while holding a browser tab" width="168">
    </td>
    <td>
      <h1>Push My Tabs</h1>
<p>Layout-aware keyboard shortcuts and quick tab actions for Chrome and Firefox from one shared core.</p>
    </td>
  </tr>
</table>

See [CHANGELOG.md](CHANGELOG.md) for user-facing changes.

- [Privacy](PRIVACY.md)
- [Support](https://github.com/pengusto/push-my-tabs/issues)
- [Website](https://pengusto.github.io/push-my-tabs/)

## Current status

Chrome and Firefox release packages share the same tested source. Firefox 142 or newer uses the browser's exact vertical-tabs setting and lets users edit supported command shortcuts directly in the settings page.

The settings page shows every command, its current assignment, and the number of missing shortcuts. The popup also offers quick actions for switching to the first or last tab, moving the current tab, duplicating, pinning, muting, or moving it to a new window.

## Languages

Chrome and Firefox automatically select the extension language from the browser UI locale. The settings page also offers a manual language override. Push My Tabs includes English, German, Spanish, French, Brazilian Portuguese, Italian, Polish, Turkish, Japanese, Simplified Chinese, Arabic, Russian, Ukrainian, Kurdish (Kurmanji), and Dari Persian. Unsupported browser locales fall back to English.

## Local Chrome test

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this directory.
4. Open `chrome://extensions/shortcuts` and assign any shortcut Chrome did not accept by default.
5. To use the extension in Incognito, open its details and enable **Allow in Incognito**. The popup explains this when the setting is missing. `⌘T` remains Chrome's native new-tab shortcut; use the assigned new-tab command (recommended: `⌥T`) for tab placement.

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

For a permanently loaded development copy, select `dist/chrome-dev` once in
`chrome://extensions` and refresh it after running `./scripts/build-chrome-dev.sh`.

## Firefox release

Firefox 142 or newer, Node.js 22, `npx`, `zip`, and `unzip` are required. The build runs pinned Mozilla `web-ext` lint. The Firefox package requests only `storage` and `browserSettings`; it declares that no data is collected or transmitted.

```sh
./scripts/build-firefox.sh
```

## Manual GitHub release

Releases are not created on every push. From the GitHub Actions **Create release** workflow, choose the exact branch or commit, enter a tag matching both manifests (for example `v1.1.0`), and optionally mark it as a pre-release. The workflow runs both package builds and attaches the Chrome and Firefox ZIPs to one GitHub Release.

Store publication remains a separate manual step: Chrome Web Store and Firefox Add-ons can then review and publish the matching archives, after which the browsers can manage user updates.

Tagged releases and their matching Chrome and Firefox archives are available on the [GitHub Releases page](https://github.com/pengusto/push-my-tabs/releases).

The extension uses no host permissions, content scripts, accounts, analytics, advertising, or remote code. Chrome's `activeTab` permission temporarily exposes only the current tab after a shortcut or popup action, allowing local geometry profiles for its origin or exact path. Firefox does not request that permission or read page data.
