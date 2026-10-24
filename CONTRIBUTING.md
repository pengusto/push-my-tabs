# Contributing

Thanks for helping improve Push My Tabs. Please open an issue before starting a larger change so the scope can be agreed first.

## Local checks

Use Node.js 22. The repository has no package-install step.

```sh
node tests/layout.test.mjs
node tests/api.test.mjs
node tests/background.test.mjs
node tests/firefox.test.mjs
node tests/i18n.test.mjs
node tests/ui.test.mjs
node tests/ui-flow.test.mjs
node tests/shortcuts.test.mjs
jq empty manifests/chrome.json manifests/firefox.json
```

Run both release builds before submitting a pull request:

```sh
./scripts/build-chrome.sh
./scripts/build-firefox.sh
```

Keep user-facing changes concise under `## Unreleased` in `CHANGELOG.md`.

## Browser UI regressions

With an existing Playwright installation and its Chromium/Firefox browsers available, run:

```sh
node tests/ui-browser.test.mjs
```

If Playwright is installed outside the project, set `PLAYWRIGHT_MODULE` to its `index.mjs` path. `SCREENSHOT_DIR` optionally retains review captures; This test starts and stops a local source server and uses isolated browser contexts with mocked extension APIs. It checks the 400 × 560 popup, narrow settings, German and Arabic copy, native/estimated/manual status, the five shared views, uncertain detection, direct browser-specific setup, Firefox suggestions, effective mappings, save failures/retry, and navigation. It is not proof of installed-extension acceptance.

For installed Chrome acceptance, run `./scripts/build-chrome-dev.sh`, load `dist/chrome-dev` in an isolated test profile, then verify the popup, TabLoop settings and a persisted setting through real extension APIs. The release build alone refreshes the ZIP, not this unpacked directory; verify the tested files match the current source. Firefox packaging also runs the pinned Mozilla linter. Keep actual-browser acceptance separate from API-mock results.

Regression lessons: popup window metadata must use a name such as `browserWindow` so it cannot shadow the global `window.close()`. Await storage before reload, keep settings reachable during uncertain detection, scope popup layout rules to `.popup`, and keep daily shortcut/setup controls above the normal 600px scroll boundary. The UI/browser tests cover these contracts.

For Zen acceptance, use an official release in an isolated temporary profile. Check `runtime.getBrowserInfo().zen`, compare the raw Firefox vertical-tabs value with the project detection result, and verify confirmation reuse and the popup. Never infer Zen support from its Firefox name or API presence. See [the detection decision](docs/adr/0002-detect-layout-from-window-geometry.md).

On 2026-10-24, isolated headless macOS tests exercised all five views, real platform/shortcut values, durable settings and a UI-triggered tab action in Chrome for Testing, Firefox 157 and official Zen 1.23.4b. Firefox reported its native vertical-tab setting. Zen reported a Firefox name plus Zen marker and an inherited native value of `false`; the app used an estimate and then a manually saved confirmation. This validates loaded extension documents and APIs, not native Zen orientation detection or the toolbar-popup lifecycle.

## Shared interface

`src/app.html`, `app.js`, and `styles.css` serve the same five destinations from `popup.js` and `options.js`. The popup is 400 × 560 pixels with scrolling inside the workspace. Full settings reuse those views and support narrow windows. Native selects replace the previous custom picker. The shipped template is parsed locally with DOMParser; user-provided settings and profile labels are rendered as text. Icons are built from local SVG geometry, without HTML injection.

`shortcuts.js` reads `runtime.getPlatformInfo()` and formats the active values from `commands.getAll()`. Do not infer Command from a runtime Ctrl value, replace unassigned shortcuts with suggestions, or claim the OS API detects physical keyboard layout. Test raw and already-symbolic values, unknown formats, and all three target OS families. Simulated Windows/Linux tests do not establish real-device acceptance.

UI commands use the explicit allowlist and callback response in `background.js`, compatible with Chrome 127 as well as Firefox. Await acknowledgement before closing the popup. A stale target fails visibly; newly uncertain geometry returns a confirmation requirement. Keyboard command races keep their previous quiet handling. The background and browser tests cover these regressions. SVG namespace identifiers and manifest homepage metadata are allowed by release validation; they are not remote executable resources.

Two regressions found during native acceptance/review are covered in the browser tests: Firefox and Zen reject `tabs.create({url: "about:addons"})`, so private-access settings must use manual instructions instead of a broken link. Saving a geometry/site confirmation must also activate Automatic mode in the same storage write; otherwise a forced global mode silently overrides the saved choice. Explain that change before saving and keep the old mode on failure.
