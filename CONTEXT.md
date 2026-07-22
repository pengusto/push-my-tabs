# TabCompass

This context describes how users navigate and rearrange Chrome tabs with layout-aware keyboard shortcuts.

## Language

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
The horizontal or vertical orientation inferred from the current Chrome window and active tab geometry when Layout Mode is automatic.
_Avoid_: Chrome setting, saved layout

**Layout Mapping**:
The horizontal or vertical half of a Shortcut Preset. Every preset contains both mappings, including the Custom Preset.
_Avoid_: Layout mode, shortcut set

**Tab Action**:
A behavior assigned to a directional command: activate the previous or next tab, move the active tab backward or forward, or do nothing.
_Avoid_: Shortcut, key binding

**Command Shortcut**:
A Chrome-managed key combination that invokes one directional command. The extension displays it as a “Befehlstaste”; users edit it in Chrome while presets determine its behavior.
_Avoid_: Hotkey, app-managed shortcut
