# Detect layout from window geometry

Infer the active tab layout from Chrome window and tab dimensions only when a command runs or the popup opens, with forced horizontal and vertical modes as overrides. Chrome exposes no public vertical-tab setting to store extensions; geometry keeps the extension local, permission-light, and idle without polling, while accepting that an open side panel can occasionally require manual override.
