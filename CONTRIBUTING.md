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
jq empty manifests/chrome.json manifests/firefox.json
```

Run both release builds before submitting a pull request:

```sh
./scripts/build-chrome.sh
./scripts/build-firefox.sh
```

Keep user-facing changes concise under `## Unreleased` in `CHANGELOG.md`.
