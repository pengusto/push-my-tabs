import assert from "node:assert/strict";
import { DEFAULT_SETTINGS, PRESETS, detectLayout, geometryKey, nextIndex, saveSiteLayoutHint, selectedAction, siteLayoutHint, siteOrigin, siteProfileKey } from "./layout.js";

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
assert.equal(siteOrigin("https://example.com/path?q=1"), "https://example.com");
assert.equal(siteOrigin("example.com/path"), "https://example.com");
assert.equal(siteOrigin("chrome-extension://abc/newtab.html"), "chrome-extension://abc");
assert.equal(siteOrigin("chrome://newtab/"), "chrome://newtab");
assert.equal(siteOrigin("about:debugging"), null);
assert.equal(siteOrigin("not a url"), null);
assert.equal(siteOrigin("javascript://example.com"), null);
assert.equal(siteProfileKey("https://example.com/a?x=1"), "https://example.com");
assert.equal(siteProfileKey("https://example.com/a?x=1#b", "path"), "https://example.com/a");
const learned = { siteProfiles: {} };
assert.equal(saveSiteLayoutHint(learned, { url: "https://example.com/a" }, "360:200", "vertical"), true);
assert.equal(siteLayoutHint(learned, { url: "https://example.com/other" }, "360:200"), "vertical");
assert.equal(saveSiteLayoutHint(learned, { url: "https://example.com/a" }, "360:200", "horizontal", "path"), true);
assert.equal(siteLayoutHint(learned, { url: "https://example.com/a?x=1" }, "360:200"), "horizontal");
assert.equal(siteLayoutHint(learned, { url: "https://example.com/other" }, "360:200"), "vertical");
assert.equal(saveSiteLayoutHint(learned, { url: "about:debugging" }, "360:200", "vertical"), false);
assert.equal(geometryKey({ width: 1512, height: 864 }, { width: 1156, height: 661 }), "360:200");
assert.equal(geometryKey({ width: 1400, height: 900 }, { width: undefined, height: undefined }), null);
const current = { layoutMode: "vertical", siteProfiles: {} };
const currentKey = geometryKey({ width: 1512, height: 864 }, { width: 1156, height: 661 });
saveSiteLayoutHint(current, { url: "https://example.com/page" }, currentKey, current.layoutMode);
assert.equal(current.siteProfiles["https://example.com"][currentKey], "vertical", "site profile stores current geometry and layout setting");

console.log("layout checks passed");
