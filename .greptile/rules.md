# Push My Tabs review rules

## Review signal

- Review the changed lines and their real callers. Report only concrete, actionable defects.
- Prioritize runtime bugs, security/privacy regressions, permission changes, browser incompatibilities, accessibility regressions, broken release invariants, and missing regression coverage for changed behavior.
- Do not report formatting, naming preferences, harmless duplication, documentation style, speculative refactors, or informational observations.
- Every finding must explain the user-visible or release-visible failure and point to the smallest safe fix. Do not invent requirements that are absent from `CONTEXT.md`, the ADRs, or the existing implementation.

## Extension architecture

- Chrome and Firefox use one shared core. Changes to commands, tab actions, presets, settings, or UI contracts must remain valid in both browsers and must not assume an API present in only one adapter.
- New or changed commands must stay consistent across `layout.js`, command handling, both manifests, and the options UI. Keep `scripts/validate-release.mjs` invariants intact.
- Preserve the tab/window context passed into command execution. Multi-window and Incognito behavior must not silently fall back to a different window or tab.
- Command shortcuts are browser-managed through the Commands API. Do not introduce arbitrary key capture or content-script keyboard handling. Browser-reserved shortcuts remain unavailable to the extension.
- Layout detection is intentionally geometry-based and may be overridden by explicit horizontal/vertical settings or stored site hints. Do not replace this with polling, page inspection, or a broader permission model.

## Security and privacy

- The extension is local-only. Flag new network requests, remote code, telemetry, analytics, account flows, URL/page-content/history collection, host permissions, content scripts, or widened permissions unless the change explicitly updates the privacy boundary and its release checks.
- Treat messages, storage values, manifest input, and tab/window data as untrusted. Preserve validation and safe DOM updates; flag unsafe HTML injection, `eval`, dynamic code loading, or unchecked command dispatch.
- `activeTab`, `incognito: "spanning"`, `chrome.storage.local`, and `globalThis.browser ?? globalThis.chrome` are intentional compatibility patterns. Do not flag them as problems without a concrete behavioral regression.

## UI and localization

- User-facing controls must remain keyboard-usable, focusable, touch-usable, and understandable at the existing responsive layouts.
- New localized message keys must exist in every locale file or have an intentional, tested fallback. Do not silently ship raw message identifiers.
- Preserve the distinction between command shortcuts (browser assignments) and tab actions (preset behavior); do not conflate their labels or settings.

## Verification

- For JavaScript behavior changes, check the affected `*.test.mjs` path and look for a regression test when a branch, parser, command route, or permission contract changes.
- For manifest or release changes, check both manifests and `node scripts/validate-release.mjs`; packaging changes also require the relevant `scripts/build-*.sh` path.
- For localization changes, check `node i18n.test.mjs`. For UI changes, check `node ui.test.mjs` and the affected runtime path.
- Do not demand the full release build for docs-only or asset-only changes. Do not treat a static test as proof of Chrome/Firefox runtime behavior; call out manual browser QA when it is the remaining gate.
