import assert from "node:assert/strict";

let vertical = true;
globalThis.browser = {
  browserSettings: { verticalTabs: { get: async () => ({ value: vertical }) } },
  storage: { local: { get: async (defaults) => defaults } }
};

const { layoutDetection } = await import("./api.js?firefox-test");
assert.deepEqual(await layoutDetection({}, null), { layout: "vertical", confidence: "exact", key: null });
vertical = false;
assert.deepEqual(await layoutDetection({}, null), { layout: "horizontal", confidence: "exact", key: null });

console.log("Firefox layout checks passed");
