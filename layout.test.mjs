import assert from "node:assert/strict";
import { DEFAULT_SETTINGS, PRESETS, detectLayout, nextIndex, selectedAction } from "./layout.js";

assert.equal(detectLayout(1400, 900, 1390, 780), "horizontal");
assert.equal(detectLayout(1400, 900, 1160, 830), "vertical");
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
