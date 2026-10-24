# Share five views and format native shortcut values

Use one packaged template and controller for the popup and full options page: Navigation, TabLoop, Layout, Shortcut bindings, and Settings. Keep the existing local WebExtension core and manifests. The approved sidebar design replaces the box-heavy layout, retaining the purple logo and accent. Local SVG geometry and native form controls keep dependencies and permissions unchanged.

TabLoop is our user-facing name for recently used open-tab cycling. CLUT refers to the separate project supplied as a functional reference and is not our feature label. Existing command identifiers and persisted settings remain compatible; there is no settings migration.

Determine the OS with `runtime.getPlatformInfo()`, then format actual bindings returned by `commands.getAll()`. The formatter only changes presentation: Command and Control remain separate, unassigned stays unassigned, and unknown formats remain readable. The OS is not the physical keyboard layout. Chrome delegates binding changes to its editor; Firefox supports direct updates. Native selects replace the old custom picker, which is removed from the package.

All UI actions use a fixed command allowlist and an explicit target tab. The background acknowledges success, reports failures, or requests layout confirmation. Callback replies retain support for Chrome 127, where asynchronous Promise replies were unavailable. Keyboard-invoked race handling remains quiet. This also prevents a newly ambiguous window size from executing an action under stale popup assumptions.

Saving a site or geometry confirmation activates Automatic mode atomically with the hint. The interface explains this when a global manual mode is active. With no geometry, the choice remains a global manual layout. Firefox and Zen prohibit opening `about:addons` with the tab API, so private-window permission controls use manual browser instructions; Chrome retains its supported extension-details link.

Sources: [Platform information](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/getPlatformInfo), [active command bindings](https://developer.chrome.com/docs/extensions/reference/api/commands), [Firefox shortcut editing](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/commands/update).

Private-window instructions follow [Mozilla's browser settings guide](https://support.mozilla.org/en-US/kb/extensions-private-browsing).
