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

const { loadSettings } = await import("./api.js");
const settings = await loadSettings();

assert.equal(settings.layoutMode, "vertical");
assert.equal(settings.presetId, DEFAULT_SETTINGS.presetId);
assert.equal(settings.customPreset.horizontal["arrow-left"], "none");
assert.equal(settings.customPreset.horizontal["arrow-right"], "switchForward");
assert.deepEqual(settings.customPreset.vertical, DEFAULT_SETTINGS.customPreset.vertical);

console.log("settings checks passed");
