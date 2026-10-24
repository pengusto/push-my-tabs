import assert from "node:assert/strict";
import { DEFAULT_SETTINGS } from "../src/layout.js";

let listener;
let verticalTabs = true;
let settings = { ...DEFAULT_SETTINGS };
let updates = [];
let moves = [];
let creations = [];
const shortcutUpdates = [];
const tabs = [
  { id: 10, index: 0, active: false },
  { id: 11, index: 1, active: true },
  { id: 12, index: 2, active: false }
];

globalThis.browser = {
  action: {},
  browserSettings: { verticalTabs: { get: async () => ({ value: verticalTabs }) } },
  commands: {
    onCommand: { addListener: (value) => { listener = value; } },
    update: async (details) => {
      if (details.shortcut === "invalid") throw new Error("Invalid shortcut");
      shortcutUpdates.push(details);
    }
  },
  storage: { local: { get: async (defaults) => ({ ...defaults, ...settings }) } },
  windows: {
    getAll: async () => [{ id: 42, tabs }],
    getLastFocused: async () => ({ id: 42, focused: true, tabs }),
    update: async () => {}
  },
  tabs: {
    get: async (id) => tabs.find((tab) => tab.id === id),
    onActivated: { addListener: () => {} },
    onRemoved: { addListener: () => {} },
    query: async () => tabs,
    create: async (properties) => creations.push(properties),
    duplicate: async () => {},
    update: async (id, properties) => updates.push([id, properties]),
    move: async (id, properties) => moves.push([id, properties])
  },
  runtime: { getBrowserInfo: async () => ({ name: "Firefox" }), onMessage: { addListener: () => {} } }
};

const { layoutDetection, updateCommandShortcut } = await import("../src/api.js?firefox-test");
assert.deepEqual(await layoutDetection({}, null), { layout: "vertical", confidence: "exact", key: null });
verticalTabs = false;
assert.deepEqual(await layoutDetection({}, null), { layout: "horizontal", confidence: "exact", key: null });

await import("../src/background.js?firefox-test");

async function command(name) {
  updates = [];
  moves = [];
  creations = [];
  await listener(name);
}

settings = { ...DEFAULT_SETTINGS, presetId: "adaptive" };
await command("new-tab-after");
assert.deepEqual(creations, [{ windowId: 42, index: 2, openerTabId: 11 }]);

verticalTabs = false;
await command("arrow-left");
assert.deepEqual(updates, [[10, { active: true }]], "adaptive horizontal activates previous tab");
await command("arrow-up");
assert.deepEqual(moves, [[11, { index: 0 }]], "adaptive horizontal moves tab backward");

verticalTabs = true;
await command("arrow-up");
assert.deepEqual(updates, [[10, { active: true }]], "adaptive vertical activates previous tab");
await command("arrow-left");
assert.deepEqual(moves, [[11, { index: 0 }]], "adaptive vertical moves tab backward");

settings = { ...DEFAULT_SETTINGS, presetId: "horizontal" };
await command("arrow-left");
assert.deepEqual(updates, [[10, { active: true }]], "horizontal Standard Preset ignores vertical layout");

settings = { ...DEFAULT_SETTINGS, presetId: "vertical" };
verticalTabs = false;
await command("arrow-up");
assert.deepEqual(updates, [[10, { active: true }]], "vertical Standard Preset ignores horizontal layout");

settings = {
  ...DEFAULT_SETTINGS,
  presetId: "custom",
  customPreset: {
    ...DEFAULT_SETTINGS.customPreset,
    horizontal: { ...DEFAULT_SETTINGS.customPreset.horizontal, "arrow-down": "switchBackward" }
  }
};
await command("arrow-down");
assert.deepEqual(updates, [[10, { active: true }]], "Custom Preset runs its saved action");

await updateCommandShortcut("arrow-left", "Ctrl+Shift+Left");
assert.deepEqual(shortcutUpdates, [{ name: "arrow-left", shortcut: "Ctrl+Shift+Left" }]);
await assert.rejects(updateCommandShortcut("arrow-left", "invalid"), /Invalid shortcut/);

// Zen retains the Firefox name and API, but uses a different tab-bar setting.
const geometryWindow = { width: 1400, height: 900 };
const geometryTab = { width: 1390, height: 780 };
const nativeGet = browser.browserSettings.verticalTabs.get;
let nativeReads = 0;
browser.runtime.getBrowserInfo = async () => ({ name: "Firefox", zen: { version: "1.23.4b" } });
browser.browserSettings.verticalTabs.get = async () => { nativeReads += 1; return { value: false }; };
assert.deepEqual(await layoutDetection(geometryWindow, geometryTab), {
  layout: "horizontal", confidence: "uncertain", key: "20:120"
}, "Zen must request confirmation even for otherwise confident geometry");
assert.equal(nativeReads, 0, "Zen must not use the inherited Firefox tab-layout setting");
assert.deepEqual(await layoutDetection(geometryWindow, geometryTab, {
  ...DEFAULT_SETTINGS, layoutHints: { "20:120": "vertical" }
}), { layout: "vertical", confidence: "remembered", key: "20:120" });
assert.deepEqual(await layoutDetection({}, null), { layout: null, confidence: "uncertain", key: null });

browser.runtime.getBrowserInfo = async () => ({ name: "Firefox" });
const warn = console.warn;
console.warn = () => {};
try {
  browser.browserSettings.verticalTabs.get = async () => { throw new Error("Unavailable"); };
  assert.equal((await layoutDetection(geometryWindow, geometryTab)).confidence, "uncertain", "native read failures require confirmation");
  browser.browserSettings.verticalTabs.get = async () => ({ value: undefined });
  assert.equal((await layoutDetection(geometryWindow, geometryTab)).confidence, "uncertain", "invalid native values must not mean horizontal");
  browser.runtime.getBrowserInfo = async () => { throw new Error("Identity unavailable"); };
  assert.equal((await layoutDetection(geometryWindow, geometryTab)).confidence, "uncertain");
} finally {
  console.warn = warn;
  browser.browserSettings.verticalTabs.get = nativeGet;
}
console.log("Firefox native layout, Zen confirmation, native-failure fallback, command, and shortcut checks passed");
