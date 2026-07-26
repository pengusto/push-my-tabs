import assert from "node:assert/strict";
import { DEFAULT_SETTINGS } from "./layout.js";

let listener;
let verticalTabs = true;
let settings = { ...DEFAULT_SETTINGS };
let updates = [];
let moves = [];
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
  windows: { getLastFocused: async () => ({ id: 42, focused: true, tabs }) },
  tabs: {
    update: async (id, properties) => updates.push([id, properties]),
    move: async (id, properties) => moves.push([id, properties])
  }
};

const { layoutDetection, updateCommandShortcut } = await import("./api.js?firefox-test");
assert.deepEqual(await layoutDetection({}, null), { layout: "vertical", confidence: "exact", key: null });
verticalTabs = false;
assert.deepEqual(await layoutDetection({}, null), { layout: "horizontal", confidence: "exact", key: null });

await import("./background.js?firefox-test");

async function command(name) {
  updates = [];
  moves = [];
  await listener(name);
}

settings = { ...DEFAULT_SETTINGS, presetId: "adaptive" };
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

console.log("Firefox layout, command, and shortcut checks passed");
