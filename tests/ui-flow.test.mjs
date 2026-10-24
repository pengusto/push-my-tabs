import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const opened = [];
globalThis.chrome = {
  commands: {},
  runtime: { getURL: (path) => `extension://${path}` },
  tabs: { create: async (details) => opened.push(details) },
  i18n: { getUILanguage: () => "en" }
};
globalThis.fetch = async (path) => ({ json: async () => JSON.parse(await readFile(path.replace("extension://", "src/"), "utf8")) });
const { initializeI18n } = await import("../src/i18n.js");
await initializeI18n("en");
const { createTaskRunner, layoutStatusText, openShortcutSetup, recommendedShortcuts } = await import("../src/ui.js");

const auto = { layoutMode: "auto" };
assert.equal(layoutStatusText(auto, { layout: "vertical", confidence: "exact" }), "Natively detected: Vertical");
assert.equal(layoutStatusText(auto, { layout: "horizontal", confidence: "confident" }), "Automatically estimated: Horizontal");
assert.equal(layoutStatusText(auto, { layout: "vertical", confidence: "uncertain" }), "Automatically estimated: Vertical");
assert.equal(layoutStatusText(auto, { layout: "vertical", confidence: "remembered" }), "Manually set: Vertical");
assert.equal(layoutStatusText({ layoutMode: "horizontal" }, { layout: "vertical", confidence: "exact" }), "Manually set: Horizontal");
assert.equal(layoutStatusText(auto, { layout: null, confidence: "uncertain" }), "Confirm tab arrangement");

const status = { hidden: true, textContent: "" };
const retry = { hidden: true };
const run = createTaskRunner(status, retry);
const events = [];
let finishFirst;
const first = run(async () => {
  events.push("first-start");
  await new Promise((resolve) => { finishFirst = resolve; });
  events.push("first-saved");
});
const second = run(async () => events.push("second-saved"));
await Promise.resolve();
assert.deepEqual(events, ["first-start"], "later selections must await the current write");
finishFirst();
assert.equal(await first, true);
assert.equal(await second, true);
assert.deepEqual(events, ["first-start", "first-saved", "second-saved"]);
assert.equal(status.textContent, "Saved.");

let fails = true;
let writes = 0;
const warn = console.warn;
console.warn = () => {};
try {
  assert.equal(await run(async () => {
    if (fails) throw new Error("storage unavailable");
    writes += 1;
  }), false);
  assert.equal(status.textContent, "Could not save. Try again.");
  assert.equal(retry.hidden, false);
  assert.equal(writes, 0);
  fails = false;
  assert.equal(await retry.onclick(), true);
  assert.equal(writes, 1, "retry repeats the actual failed save");
  assert.equal(retry.hidden, true);
  assert.equal(status.textContent, "Saved.");

} finally {
  console.warn = warn;
}

await openShortcutSetup("recent-shortcuts");
assert.deepEqual(opened.pop(), { url: "chrome://extensions/shortcuts" });
chrome.commands.update = async () => {};
await openShortcutSetup("recent-shortcuts");
assert.deepEqual(opened.pop(), { url: "extension://options.html#recent-shortcuts" });
assert.equal(recommendedShortcuts("MacIntel")["recent-tab-switch"], "Alt+S");
assert.equal(recommendedShortcuts("Win32")["recent-tab-switch-reverse"], "Alt+Shift+S");
assert.equal(recommendedShortcuts("MacIntel")["arrow-left"], "Command+Left");
console.log("UI save/retry ordering and browser-specific shortcut setup checks passed");
