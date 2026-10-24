# Distinguish native layout, geometry estimates, and user confirmations

Read Firefox 142+’s public `browserSettings.verticalTabs` setting when available. Otherwise infer the tab layout from window and active-tab dimensions only when a command runs or the popup opens. Manual horizontal and vertical modes override automatic detection. Chrome’s public tabs/windows API has no documented orientation field; geometry keeps this local and idle without polling, while an open side panel may require confirmation.

The popup identifies the source as **Natively detected** for a native boolean, **Automatically estimated** for geometry, or **Manually set** for an explicit mode or a remembered site/path/geometry confirmation. Unavailable dimensions show a confirmation request rather than an invented result. A failed native read also requires confirmation.

Zen needs separate handling. Its `runtime.getBrowserInfo()` retains the Firefox name but adds a `zen` object. Zen’s own tab bar does not use Firefox’s `sidebar.verticalTabs` preference, which Zen 1.23.4b locks to false. Do not interpret its inherited Firefox API as the visible tab orientation. Detect the Zen marker, bypass that setting, and require a first geometry confirmation; saved confirmations remain reusable. This does not add a native Zen detection claim or new permissions.

Sources: [Firefox API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserSettings/verticalTabs), [Zen browser identity](https://github.com/zen-browser/desktop/blob/1.23.4b/src/toolkit/components/extensions/parent/ext-runtime-js.patch), [Zen preferences](https://github.com/zen-browser/desktop/blob/1.23.4b/prefs/firefox/browser.yaml), [Chrome tabs](https://developer.chrome.com/docs/extensions/reference/api/tabs), [Chrome windows](https://developer.chrome.com/docs/extensions/reference/api/windows).

Regression lesson: the presence of an inherited API does not establish that a browser fork uses its underlying setting. `tests/firefox.test.mjs` checks stock Firefox, Zen’s identity and setting mismatch, and native-read failures; `tests/ui-flow.test.mjs` checks the source labels.
