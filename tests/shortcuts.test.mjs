import assert from "node:assert/strict";
globalThis.chrome = { runtime: { getPlatformInfo: async () => ({ os: "linux" }) } };
const { platformOS, platformName, shortcutLabel } = await import("../src/shortcuts.js");
assert.equal(await platformOS(), "linux");
assert.equal(platformName("mac"), "macOS");
assert.equal(platformName("win"), "Windows");
for (const os of ["win", "linux"]) {
  assert.equal(shortcutLabel("Ctrl+Shift+Left", os), "Ctrl+Shift+←");
  assert.equal(shortcutLabel("Alt+S", os), "Alt+S");
  assert.equal(shortcutLabel("", os), "");
}
assert.equal(shortcutLabel("Command+Alt+Left", "mac"), "⌘⌥←");
assert.equal(shortcutLabel("Ctrl+Left", "mac"), "⌃←", "runtime Control must not become Command");
assert.equal(shortcutLabel("MacCtrl+Shift+Right", "mac"), "⌃⇧→");
assert.equal(shortcutLabel("⌘⇧S", "mac"), "⌘⇧S", "already formatted native shortcut");
assert.equal(shortcutLabel("⌥←", "mac", true), "Alt+Left");
assert.equal(shortcutLabel("Ctrl + Shift + PageUp", "linux"), "Ctrl+Shift+PageUp");
assert.equal(shortcutLabel("Unbekannt + Taste", "mac"), "Unbekannt + Taste", "unknown formats remain intact");
assert.equal(shortcutLabel("Strg+Left", "win"), "Ctrl+←");
chrome.runtime.getPlatformInfo = async () => { throw new Error("unavailable"); };
const warn = console.warn;
console.warn = () => {};
try { assert.equal(await platformOS(), "unknown"); } finally { console.warn = warn; }
console.log("Native platform and Mac/Windows/Linux shortcut formatting checks passed");
