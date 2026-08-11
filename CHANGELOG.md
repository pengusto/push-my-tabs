# Changelog

All notable user-facing changes to Push My Tabs are documented here.

## Unreleased

## 1.1.0 - 2026-08-11

### Added

- Show a shortcut assignment summary and include all tab commands in the settings page.
- Add popup quick actions for first/last tab navigation, moving, duplicating, pinning, muting, and moving a tab to a new window.
- Add matching Chrome and Firefox commands for the new tab actions.
- Add next/previous window switching and moving the current tab to the next window.
- Introduce Molebyte as the Push My Tabs mascot in the README and optional Chrome Web Store promotional artwork.
- Choose whether closing the active tab selects the tab before or after it.
- Assign dedicated shortcuts for browser history back and forward.
- Open a new tab before, after, or at the end of the current tab strip.
- Show platform-specific recommended shortcuts alongside the current assignments.
- Cycle through recently used tabs across browser windows with quick, normal, and reverse commands.

### Fixed

- Prefer the tab that opened a newly closed active tab, with the configured previous/next tab as fallback.
- Constrain the Chrome popup root so no oversized blank extension area appears to its right.
- Show a thin dark/violet popup scrollbar on the right inside the frame without an outer gutter.
- Keep the popup at its normal content height and scroll only after Chrome's 600px limit.
- Keep the popup size stable after saving a site layout profile.
- Close the popup after opening the full settings page to avoid two extension surfaces overlapping.
- Keep Chrome extension settings in the shared Incognito storage context and explain the user-controlled Incognito permission when it is missing.
- Use Chrome's command tab context so shortcuts continue to target the correct window, including Incognito and multi-window use.
- Ignore missing-window/tab races during startup and activation instead of surfacing them as extension errors.

## 1.0.2 - 2026-07-26

### Added

- Add imprint and website privacy pages to the project website.
- Add Firefox 142+ packaging with exact vertical-tab detection and direct command-shortcut editing.

### Changed

- Refresh the extension, website, favicon, and store artwork with the new directional key logo.

## 1.0.1 - 2026-07-26

### Added

- Remember the current browser geometry for a whole site or only the current path directly from the popup.
- Reuse site and path confirmations in automatic mode and manage learned profiles in settings.

### Fixed

- Keep uncertain New-Tab geometry from silently falling back to horizontal or losing its popup/badge recovery path when only one tab is open.
- Keep the site and path learning buttons visible for forced layouts and while confirming an uncertain automatic result.
- Edit or remove the current site and path profile directly in the popup with compact layout arrows.
- Keep the popup stable instead of reloading and resizing when its first site profile is saved.
- Align layout status arrows with the text and save the current geometry together with the active layout setting.
- Remove the redundant status dot and increase the centered layout arrow for readability.
- Show every saved profile's geometry and layout in settings instead of hiding it behind a count.
- Show the current saved geometry directly in the extension popup's site and path editor.
- Label saved geometry as browser side and top gaps instead of presenting it as a page size.

### Improved

- Replace the original arrow tile with one clean, small-size-safe logo across the extension, website, favicon, screenshots, and store artwork.
- Add the interactive GitHub Pages project website.

## 1.0.0 - 2026-07-23

### Added

- Added automatic browser-language support and a manual language selector for 15 languages, including Arabic and Dari Persian with right-to-left layout and Kurdish (Kurmanji).
- Switch or move tabs with four browser-managed directional shortcuts.
- Choose automatic, forced horizontal, or forced vertical tab layout behavior.
- Use three built-in shortcut presets or configure separate custom mappings for horizontal and vertical layouts.
- Configure whether tab switching wraps at the first and last tab while tab movement remains bounded.
- View and change the active layout mode and shortcut preset from the popup.
- Manage mappings, shortcut bindings, and behavior from the settings page.
- Share the same permission-light core between Chrome and Firefox without access to page content or browsing history.

### Improved

- Made popup and settings controls responsive, keyboard accessible, and readable in light and dark browser themes.
- Clarified detected versus manually forced layouts in the popup.
