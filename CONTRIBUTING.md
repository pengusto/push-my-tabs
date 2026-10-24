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

If Playwright is installed outside the project, set `PLAYWRIGHT_MODULE` to its `index.mjs` path. `SCREENSHOT_DIR` optionally retains review captures; `FIREFOX_BINARY` optionally selects a compatible Firefox test binary. This test starts and stops a local source server and uses isolated browser contexts with mocked extension APIs. It checks the 360 × 600 popup, narrow settings, German and Arabic copy, native/estimated/manual status, uncertain detection, direct browser-specific setup, Firefox suggestions, effective mappings, save failures/retry, and navigation. It is not proof of installed-extension acceptance.

For installed Chrome acceptance, build `dist/chrome-dev`, load it in an isolated test profile, then verify the popup, CLUT settings and a persisted setting through real extension APIs. Firefox packaging also runs the pinned Mozilla linter. Keep actual-browser acceptance separate from API-mock results.

Regression lessons: popup window metadata must use a name such as `browserWindow` so it cannot shadow the global `window.close()`. Await storage before reload, keep settings reachable during uncertain detection, scope popup layout rules to `.popup`, and keep daily shortcut/setup controls above the normal 600px scroll boundary. The UI/browser tests cover these contracts.

For Zen acceptance, use an official release in an isolated temporary profile. Check `runtime.getBrowserInfo().zen`, compare the raw Firefox vertical-tabs value with the project detection result, and verify confirmation reuse and the popup. Never infer Zen support from its Firefox name or API presence. See [the detection decision](docs/adr/0002-detect-layout-from-window-geometry.md).

On 2026-10-24, an isolated headless macOS test with official Zen 1.23.4b confirmed the Firefox name plus Zen marker, an inherited native value of `false`, the estimated popup status, and a saved confirmation changing it to manually set. This validates the API and extension flow; it does not assert native Zen orientation detection.
