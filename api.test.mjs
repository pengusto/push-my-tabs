import assert from "node:assert/strict";
import { DEFAULT_SETTINGS } from "./layout.js";

globalThis.chrome = {
  storage: {
    local: {
      get: async () => ({
        layoutMode: "vertical",
        customPreset: { horizontal: { "arrow-left": "none" } }
      })
    }
  }
};

const { isLayoutDetectionAmbiguous, loadSettings, recommendedAmbiguousLayout } = await import("./api.js");
const settings = await loadSettings();

assert.equal(settings.layoutMode, "vertical");
assert.equal(settings.locale, "browser");
assert.equal(settings.presetId, DEFAULT_SETTINGS.presetId);
assert.equal(settings.customPreset.horizontal["arrow-left"], "none");
assert.equal(settings.customPreset.horizontal["arrow-right"], "switchForward");
assert.deepEqual(settings.customPreset.vertical, DEFAULT_SETTINGS.customPreset.vertical);
assert.equal(isLayoutDetectionAmbiguous(
  { width: 1512, height: 864 },
  { width: 1156, height: 661 }
), true);
assert.equal(isLayoutDetectionAmbiguous(
  { width: 2560, height: 1410 },
  { width: 2320, height: 1329 }
), false);
assert.equal(recommendedAmbiguousLayout(
  { width: 1512 },
  { width: 1156 }
), "vertical");
assert.equal(recommendedAmbiguousLayout(
  { width: 2560 },
  { width: 2174 }
), "horizontal");

console.log("settings checks passed");
