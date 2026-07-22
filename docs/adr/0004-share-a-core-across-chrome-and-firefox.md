# Share a core across Chrome and Firefox

Build one WebExtension core for tab actions, presets, settings, and UI, with thin browser-specific manifests and adapters. Publish Chrome first and Firefox afterward from the same tested version; Chrome infers vertical tabs from geometry and delegates shortcut editing to Chrome, while Firefox uses its official vertical-tabs setting and may edit command shortcuts through its API.
