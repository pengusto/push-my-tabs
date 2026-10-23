<img src="docs/assets/push-my-tabs-penguin.png" alt="Push My Tabs — Tabs that follow your direction." width="100%">

English · [Deutsch](docs/readme/README.de.md) · [简体中文](docs/readme/README.zh-CN.md) · [日本語](docs/readme/README.ja.md) · [Español](docs/readme/README.es.md) · [한국어](docs/readme/README.ko.md) · [Português (Brasil)](docs/readme/README.pt-BR.md) · [Français](docs/readme/README.fr.md)

# Push My Tabs

<p align="center"><strong>Switch and move tabs the way they appear.</strong><br>Layout-aware keyboard shortcuts and quick tab actions for Chrome and Firefox.</p>

<p align="center"><a href="https://chromewebstore.google.com/detail/bagfcickffpfkgecknaepmfleikeojik"><strong>Install for Chrome ↗</strong></a> · <a href="https://addons.mozilla.org/firefox/addon/push-my-tabs/"><strong>Install for Firefox ↗</strong></a> · <a href="https://pengusto.github.io/push-my-tabs/">Website</a></p>

<p align="center">Chrome 127+ · Firefox 142+</p>

## Find your flow

For keyboard-first browsing with horizontal or vertical tabs.

Horizontal tabs? Switch left and right. Vertical tabs? Switch up and down.
The adaptive preset maps the four direction commands to your tab layout, so switching and moving tabs stay easy to understand.

![Animated illustration: switch right with horizontal tabs, switch down with vertical tabs, then move the active horizontal tab forward.](docs/assets/penguin/tabs-demo.gif)

[View the static illustration](docs/assets/penguin/tabs-demo-poster.png).

*Function illustration of the adaptive preset, not a screen recording. Direction labels refer to extension commands; assign your preferred keyboard shortcuts in your browser.*

| With horizontal tabs | With vertical tabs |
| :--- | :--- |
| **Left / Right** → switch tabs | **Up / Down** → switch tabs |
| **Up / Down** → move the active tab | **Left / Right** → move the active tab |

## Small actions. Fewer interruptions.

- **Navigate by direction.** Switch tabs or move the active tab with the adaptive preset.
- **Keep quick actions close.** Duplicate, pin, mute, jump to the first or last tab, or move a tab to a new window.
- **Make it yours.** Choose your layout and shortcut assignments. Keep optional commands out of the way until you need them.

<p align="center"><img src="docs/assets/penguin/mascot.png" width="132" alt="A penguin waves while holding a browser tab"></p>

## Get started

1. Install from the Chrome Web Store or Firefox Add-ons using the links above.
2. Open the extension popup to see your four direction commands and their current assignments.
3. Set or adjust your shortcuts in your browser. Start with the adaptive preset; choose a manual layout if automatic detection does not match your setup.

Chrome estimates the layout from window geometry; an open side panel can affect detection. Firefox 142+ reads its vertical-tabs setting directly.

## Your tabs stay yours

No accounts, analytics, advertising, or remote code. Settings stay in your browser.
Chrome uses temporary `activeTab` access after a shortcut or popup action for local layout profiles. Firefox uses `storage` and `browserSettings` without reading page data.

[Privacy](PRIVACY.md) · [Support](https://github.com/pengusto/push-my-tabs/issues) · [Releases](https://github.com/pengusto/push-my-tabs/releases) · [Changelog](CHANGELOG.md)

<details>
<summary><strong>Languages, development, testing & release details</strong></summary>

## Current status

Chrome and Firefox release packages share the same tested source. Firefox 142 or newer uses the browser's exact vertical-tabs setting and lets users edit supported command shortcuts directly in the settings page.

The popup and settings page show the four direction shortcuts with their current browser assignments. Optional shortcuts stay in a separate collapsed section. The popup also offers quick actions for switching to the first or last tab, moving the current tab, duplicating, pinning, muting, or moving it to a new window.

## Languages

Chrome and Firefox automatically select the extension language from the browser UI locale. The settings page also offers a manual language override. Push My Tabs includes English, German, Spanish, French, Brazilian Portuguese, Italian, Polish, Turkish, Japanese, Simplified Chinese, Arabic, Russian, Ukrainian, Kurdish (Kurmanji), and Dari Persian. Unsupported browser locales fall back to English.

## Local Chrome test

From the repository root, with Node.js 22, `zip`, and `unzip` available (no package-install step):

```sh
./scripts/build-chrome-dev.sh
```

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select `dist/chrome-dev`.
4. Confirm the four direction shortcuts, then assign any optional shortcut you want at `chrome://extensions/shortcuts`.
5. To use the extension in Incognito, open its details and enable **Allow in Incognito**. The popup explains this when the setting is missing. `⌘T` remains Chrome's native new-tab shortcut; use the assigned new-tab command (recommended: `⌥T`) for tab placement.

## Checks

```sh
node tests/layout.test.mjs
node tests/api.test.mjs
node tests/background.test.mjs
node tests/firefox.test.mjs
node tests/i18n.test.mjs
node tests/ui.test.mjs
jq empty manifests/chrome.json manifests/firefox.json
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

Releases are not created on every push. From the GitHub Actions **Create release** workflow, choose the exact branch or commit, enter a tag matching both manifests (for example `v1.2.0`), and optionally mark it as a pre-release. The workflow runs both package builds and attaches the Chrome and Firefox ZIPs to one GitHub Release.

Store publication remains a separate manual step: Chrome Web Store and Firefox Add-ons can then review and publish the matching archives, after which the browsers can manage user updates.

Tagged releases and their matching Chrome and Firefox archives are available on the [GitHub Releases page](https://github.com/pengusto/push-my-tabs/releases).

See [CONTRIBUTING.md](CONTRIBUTING.md) to work on Push My Tabs and [SECURITY.md](SECURITY.md) to report a vulnerability privately.

The extension uses no host permissions, content scripts, accounts, analytics, advertising, or remote code. Chrome's `activeTab` permission temporarily exposes only the current tab after a shortcut or popup action, allowing local geometry profiles for its origin or exact path. Firefox does not request that permission or read page data.

</details>

## License

[MIT](LICENSE). See [asset provenance](docs/assets/README.md) for the README illustrations.
