# Contributing

Thanks for helping improve Push My Tabs. Please open an issue before starting a larger change so the scope can be agreed first.

## Local checks

Use Node.js 22. The repository has no package-install step.

```sh
node layout.test.mjs
node api.test.mjs
node background.test.mjs
node firefox.test.mjs
node i18n.test.mjs
node ui.test.mjs
jq empty manifest.json manifest.firefox.json
```

Run both release builds before submitting a pull request:

```sh
./scripts/build-chrome.sh
./scripts/build-firefox.sh
```

Keep user-facing changes concise under `## Unreleased` in `CHANGELOG.md`.
