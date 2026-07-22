# Use Chrome-managed command shortcuts

Use Chrome's Commands API for browser-wide command shortcuts and let users edit their keys in Chrome's shortcut editor. The extension displays those bindings as “Befehlstasten” and owns their preset-based behavior; it does not capture arbitrary keys itself because content scripts would require broad website access and still fail on protected pages and browser UI.
