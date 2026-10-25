import assert from "node:assert/strict";
import { DEFAULT_SETTINGS } from "../src/layout.js";

globalThis.chrome = {
  extension: { isAllowedIncognitoAccess: async () => false },
  storage: {
    local: {
      get: async () => ({
        layoutMode: "vertical",
        closeDirection: "opener-forward",
        customPreset: { horizontal: { "arrow-left": "none" } }
      })
    }
  }
};

const { detectedLayout, isIncognitoAllowed, isLayoutDetectionAmbiguous, layoutDetection, loadSettings, recommendedAmbiguousLayout } = await import("../src/api.js");
const settings = await loadSettings();

assert.equal(settings.layoutMode, "vertical");
assert.equal(settings.locale, "browser");
assert.equal(settings.presetId, DEFAULT_SETTINGS.presetId);
assert.equal(settings.closeDirection, "browser", "legacy opener modes fall back to Chrome's native behavior");
assert.equal(settings.customPreset.horizontal["arrow-left"], "none");
assert.equal(settings.customPreset.horizontal["arrow-right"], "switchForward");
assert.deepEqual(settings.customPreset.vertical, DEFAULT_SETTINGS.customPreset.vertical);
assert.equal(await isIncognitoAllowed({ incognito: true }), false);
assert.equal(await isIncognitoAllowed({ incognito: false }), true);
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
assert.equal(await detectedLayout({ width: 1400, height: 900 }, { width: undefined, height: undefined }), null);
assert.equal(recommendedAmbiguousLayout({ width: 1400 }, { width: undefined }), null);
assert.deepEqual(await layoutDetection(
  { width: 1512, height: 864 },
  { width: 1156, height: 661 },
  { layoutHints: { "360:200": "horizontal" } }
), { layout: "horizontal", confidence: "remembered", key: "360:200" });
assert.deepEqual(await layoutDetection(
  { width: 1512, height: 864 },
  { width: 1156, height: 661, url: "https://example.com/a" },
  {
    layoutHints: { "360:200": "horizontal" },
    siteProfiles: {
      "https://example.com": { "360:200": "vertical" },
      "https://example.com/a": { "360:200": "horizontal" }
    }
  }
), { layout: "horizontal", confidence: "remembered", key: "360:200" });

const shared = {
  layoutHints: { "360:200": "vertical", "360:240": "horizontal" },
  siteProfiles: {}
};
const browserWindow = { width: 1512, height: 864 };
const active = { width: 1156, height: 664, url: "https://example.com/a" };
for (const url of [active.url, "https://another.example/b", "chrome://newtab/"]) {
  assert.deepEqual(await layoutDetection(browserWindow, { ...active, url }, shared), {
    layout: "vertical", confidence: "remembered", key: "360:200"
  }, "a shared confirmation survives navigation and switching sites");
}
assert.deepEqual(await layoutDetection(browserWindow, { ...active, width: 1136 }, shared), {
  layout: "vertical", confidence: "remembered", key: "380:200"
}, "one rounding step of width jitter does not reverse the layout");
assert.deepEqual(await layoutDetection(browserWindow, { ...active, height: 644 }, shared), {
  layout: null, confidence: "uncertain", key: "360:220"
}, "conflicting nearby orientations require confirmation instead of guessing");
assert.deepEqual(await layoutDetection(browserWindow, { ...active, height: 624 }, shared), {
  layout: "horizontal", confidence: "remembered", key: "360:240"
}, "switching to a separately confirmed orientation takes effect immediately");
assert.deepEqual(await layoutDetection(browserWindow, { ...active, width: 1116 }, shared), {
  layout: "horizontal", confidence: "uncertain", key: "400:200"
}, "a nearby reuse never expands into another rounding step");
assert.equal((await layoutDetection(browserWindow, { ...active, width: 1136, height: 644 }, shared)).confidence, "uncertain",
  "diagonal changes exceed the single-step allowance");
assert.equal((await layoutDetection(browserWindow, { ...active, width: 770 }, shared)).confidence, "uncertain",
  "an added side panel is not covered by an unrelated calibration");
assert.equal((await layoutDetection(browserWindow, { ...active, width: undefined }, shared)).layout, null,
  "remembered state never invents missing dimensions");
assert.equal((await layoutDetection(browserWindow, active, {
  ...shared, siteProfiles: { "https://example.com/a": { "360:200": "horizontal" } }
})).layout, "horizontal", "explicit path overrides still take precedence");
assert.deepEqual(shared.layoutHints, { "360:200": "vertical", "360:240": "horizontal" },
  "detection never persists inferred measurements or drifts its calibration");
for (const width of [1473, 1471]) {
  assert.equal((await layoutDetection(browserWindow, { width, height: 784 })).confidence, "uncertain",
    "a two-pixel change across the side threshold does not confidently reverse commands");
}
for (const height of [765, 763]) {
  assert.equal((await layoutDetection(browserWindow, { width: 1200, height })).confidence, "uncertain",
    "a two-pixel change across the top threshold needs confirmation");
}
assert.deepEqual(await layoutDetection(browserWindow, { width: 1156, height: 784 }, {
  layoutHints: { "360:100": "horizontal" }
}), { layout: null, confidence: "uncertain", key: "360:80" },
"a nearby horizontal hint cannot mask a clear vertical estimate");

console.log("settings and conservative cross-site layout checks passed");
