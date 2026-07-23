import assert from "node:assert/strict";
import { DEFAULT_SETTINGS, PRESETS, detectLayout, nextIndex, selectedAction } from "./layout.js";

const chromeGeometry = [
  ["vertical expanded", 2560, 1410, 2320, 1329, "vertical"],
  ["vertical expanded with side panel", 2560, 1410, 1934, 1321, "vertical"],
  ["vertical collapsed", 2560, 1410, 2504, 1329, "vertical"],
  ["vertical collapsed with side panel", 2560, 1410, 2118, 1321, "vertical"],
  ["horizontal", 2560, 1410, 2560, 1289, "horizontal"],
  ["horizontal with side panel", 2560, 1410, 2174, 1281, "horizontal"]
];
for (const [name, windowWidth, windowHeight, tabWidth, tabHeight, expected] of chromeGeometry) {
  assert.equal(detectLayout(windowWidth, windowHeight, tabWidth, tabHeight), expected, name);
}
assert.equal(selectedAction(DEFAULT_SETTINGS, "horizontal", "arrow-left"), "switchBackward");
assert.equal(selectedAction(DEFAULT_SETTINGS, "vertical", "arrow-left"), "moveBackward");

for (const [presetId, preset] of Object.entries(PRESETS)) {
  for (const layout of ["horizontal", "vertical"]) {
    for (const [command, action] of Object.entries(preset[layout])) {
      assert.equal(selectedAction({ ...DEFAULT_SETTINGS, presetId }, layout, command), action);
    }
  }
}

const custom = {
  ...DEFAULT_SETTINGS,
  presetId: "custom",
  customPreset: {
    ...DEFAULT_SETTINGS.customPreset,
    vertical: { ...DEFAULT_SETTINGS.customPreset.vertical, "arrow-left": "none" }
  }
};
assert.equal(selectedAction(custom, "vertical", "arrow-left"), "none");
assert.equal(selectedAction({ ...DEFAULT_SETTINGS, presetId: "missing" }, "horizontal", "arrow-left"), "switchBackward");
assert.equal(nextIndex(0, -1, 4, true), 3);
assert.equal(nextIndex(0, -1, 4, false), 0);
assert.equal(nextIndex(3, 1, 4, false), 3);

console.log("layout checks passed");
