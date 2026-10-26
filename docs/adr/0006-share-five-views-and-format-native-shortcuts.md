# Share five views and format native shortcut values

Use one packaged template and controller for the popup and full options page: Navigation, TabLoop, Layout, Shortcut bindings, and Settings. Keep the existing local WebExtension core and manifests. The approved sidebar design replaces the box-heavy layout, retaining the purple logo and accent. Local SVG geometry and native form controls keep dependencies and permissions unchanged.

TabLoop is our user-facing name for recently used open-tab cycling. CLUT refers to the separate project supplied as a functional reference and is not our feature label. Existing command identifiers and persisted settings remain compatible; there is no settings migration.

Determine the OS with `runtime.getPlatformInfo()`, then format actual bindings returned by `commands.getAll()`. The formatter only changes presentation: Command and Control remain separate, unassigned stays unassigned, and unknown formats remain readable. The OS is not the physical keyboard layout. Chrome delegates binding changes to its editor; Firefox supports direct updates. Native selects replace the old custom picker, which is removed from the package.

All UI actions use a fixed command allowlist and an explicit target tab. The background acknowledges success, reports failures, or requests layout confirmation. Callback replies retain support for Chrome 127, where asynchronous Promise replies were unavailable. Keyboard-invoked race handling remains quiet. This also prevents a newly ambiguous window size from executing an action under stale popup assumptions.

Saving a site or geometry confirmation activates Automatic mode atomically with the hint. The interface explains this when a global manual mode is active. With no geometry, the choice remains a global manual layout. Firefox and Zen prohibit opening `about:addons` with the tab API, so private-window permission controls use manual browser instructions; Chrome retains its supported extension-details link.

Sources: [Platform information](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/getPlatformInfo), [active command bindings](https://developer.chrome.com/docs/extensions/reference/api/commands), [Firefox shortcut editing](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/commands/update).

Private-window instructions follow [Mozilla's browser settings guide](https://support.mozilla.org/en-US/kb/extensions-private-browsing).


Shortcut bindings is also the command inventory: each supported command shows actual assignment status and a distinct recommendation or no-standard-recommendation message. Count only supported commands, not the toolbar action or unknown browser entries. Refresh status and counts both on focus and after a successful Firefox save; retain focused inputs during those updates. TabLoop's binding group comes first and starts expanded; Chrome's edit button precedes the inventory. Reuse this destination rather than add another competing sidebar menu.

Keep curated recommendations in `ui.js` as the single source, limited to direction commands, normal/reverse TabLoop and new-tab-after. Do not invent suggestions when the OS is unknown or imply that a suggested shortcut is free. Existing assignments remain unchanged. The former Mac `Command+Alt+Up/Down` history suggestions collide with Chrome's documented toolbar/dialog focus navigation and were removed. Fast cycling and uncommon commands do not need a standard shortcut. `tests/ui-flow.test.mjs` checks the curated set and internal uniqueness; `tests/ui-browser.test.mjs` checks separate actual/recommended values, unassigned rows, counts, focus refresh and Firefox saves. [Chrome's keyboard shortcuts](https://support.google.com/chrome/answer/157179) document the native conflict. Cross-extension checks require inspection outside this extension: `commands.getAll()` returns only its own commands.

Display the shortcut inventory in two columns with stacked labels, actual keys and recommendations. Below 280px of available view width, use one column. Let Firefox editing controls wrap within each cell.

Mark installation defaults from each packaged manifest’s `suggested_key` with a separate badge. The badge describes the supplied default, not the origin of the current assignment; browser conflicts and user changes can alter actual bindings. Optional recommendations such as TabLoop are not installation defaults.
