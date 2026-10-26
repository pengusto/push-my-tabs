# Push My Tabs

This context describes how users navigate and rearrange browser tabs with layout-aware keyboard shortcuts.

## Language

**TabLoop**:
Push My Tabs’ function for cycling through recently used open tabs across windows, with normal, reverse, and quick commands. It does not show or store a browsing-history list.
_Avoid_: CLUT (the name of a separate extension), history, recently closed tabs

**Shortcut Display**:
A presentation of the browser-reported active command binding, formatted for the operating system from `runtime.getPlatformInfo()`. Display formatting never reassigns keys or substitutes a recommendation for an empty binding; Control and Command remain distinct.
_Avoid_: OS-based remapping, keyboard-layout detection

**Shortcut Preset**:
A named, selectable mapping of arrow-key commands to tab actions for horizontal and vertical tab layouts.
_Avoid_: Template, shortcut variant, profile

**Standard Preset**:
One of three built-in Shortcut Presets that users can select but not modify or delete.
_Avoid_: Default template

**Custom Preset**:
The single user-editable Shortcut Preset in the first release.
_Avoid_: User profile, custom template

**Layout Mode**:
The selected source of tab-strip orientation: automatically detected, forced horizontal, or forced vertical. It selects which mapping of the active Shortcut Preset applies.
_Avoid_: Preset, tab position

**Detected Layout**:
The horizontal or vertical orientation obtained from Firefox’s native setting or estimated from window and active-tab geometry when Layout Mode is automatic. The popup states its source; user-confirmed geometry and site profiles are manually set, even in automatic mode.
_Avoid_: Chrome setting, saved layout

**Site Layout Profile**:
A local mapping from rounded browser geometry to a confirmed layout for either an exact origin or an exact path. It improves automatic detection without overriding the global Layout Mode.
_Avoid_: Forced site mode, URL history, content rule

**Layout Hint**:
A locally stored confirmation for one rounded browser window/tab geometry. A site or path profile takes precedence over a global hint; both can be removed from settings.

New confirmations default to a global Layout Hint, reusable across sites. A nearby match allows one 20px step in either rounded gap, never both; conflicting nearby orientations require confirmation. Matching does not write new hints. Explicit site/path confirmations retain their scope.
_Avoid_: Guaranteed detection, forced site mode

**Layout Mapping**:
The horizontal or vertical half of a Shortcut Preset. Every preset contains both mappings, including the Custom Preset.
_Avoid_: Layout mode, shortcut set

**Tab Action**:
A behavior assigned to a directional command: activate the previous or next tab, move the active tab backward or forward, or do nothing.
_Avoid_: Shortcut, key binding

**Command Shortcut**:
A browser-managed key combination that invokes one command. The extension calls it a “Shortcut” or “Tastenkombination”; users edit it in the browser while presets determine the behavior of the four direction shortcuts.
_Avoid_: Hotkey, app-managed shortcut

**Shortcut Recommendation**:
An optional, platform-formatted suggestion for a Command Shortcut. It is separate from the actual browser-reported assignment and never implies that a key combination is free on the user's computer. Some supported commands deliberately have no recommendation. Chrome edits remain in its browser editor; Firefox can apply a suggestion through its commands API.
