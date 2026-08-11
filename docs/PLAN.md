# Release plan

## 1. Prove the Chrome core

- Load the unpacked extension in current Chrome Stable.
- Confirm all four commands are accepted or can be assigned at `chrome://extensions/shortcuts` on macOS.
- Verify switching and moving at the first, middle, and last tab.
- Verify `Auto`, forced `Horizontal`, and forced `Vertical` with horizontal tabs, expanded vertical tabs, collapsed vertical tabs, and an open side panel.
- Record the real window/tab dimensions for misclassified layouts and adjust the detector once.

**Gate:** all core actions work without console errors; manual overrides are always correct; Auto is reliable in the tested Chrome layouts.

## 2. Finish the user experience

- Review popup and options page in light and dark mode, keyboard-only, and at 200% zoom.
- Make detected layout, active preset, missing command bindings, and save errors obvious.
- Confirm the three standard presets and custom mappings use understandable labels.
- Add German and English extension strings through browser localization.

**Gate:** a new user can install, assign commands, choose a preset, and understand Auto mode without documentation.

## 3. Package the Chrome release

- Confirm the final `Push My Tabs` name is safe enough to publish.
- Finish Chrome store screenshots, descriptions, permission rationale, support, and privacy links.
- Add a deterministic Chrome packaging command and CI checks.

**Gate:** the Chrome archive is reproducible, contains only release files, and its store material contains no placeholders.

## 4. Publish the source on GitHub

- Review the initial history for secrets, local scratch files, and machine-specific paths.
- Make the repository public under `pengusto` and run CI from a clean checkout.
- Tag each release and attach its reproducible Chrome archive.

**Gate:** public tagged source and the attached Chrome artifact match.

## 5. Submit Chrome

- Complete Chrome Web Store registration and upload the tagged archive.
- Resolve reviewer findings against the same source of truth.
- Verify the approved listing from a clean profile.

**Gate:** Push My Tabs is live and installable from the Chrome Web Store.

## 6. Deliver Firefox from the shared core

- Verify exact vertical-tab detection and shortcut editing in Firefox.
- Package with pinned Mozilla linting without duplicating product source.
- Submit the same proven behavior to Firefox Add-ons with its additional permission explained.

**Gate:** Push My Tabs is live and installable from Firefox Add-ons.

## Immediate next action

Submit `push-my-tabs-chrome-1.1.0.zip` from the `v1.1.0` GitHub release to the Chrome Web Store.
