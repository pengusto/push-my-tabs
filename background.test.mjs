import assert from "node:assert/strict";

let listener;
let settings = { layoutMode: "horizontal", presetId: "adaptive", wrapSwitching: true };
let tabs = [];
let updates = [];
let moves = [];
let popupOpens = 0;
let popupOptions;
let badgeTexts = [];
let windowFocused = true;

globalThis.chrome = {
  action: {
    openPopup: async (options) => { popupOpens += 1; popupOptions = options; },
    setBadgeText: async (details) => badgeTexts.push(details)
  },
  commands: { onCommand: { addListener: (value) => { listener = value; } } },
  storage: { local: { get: async (defaults) => ({ ...defaults, ...settings }) } },
  windows: {
    getLastFocused: async () => ({ id: 42, focused: windowFocused, width: 1400, height: 900, tabs })
  },
  tabs: {
    update: async (id, properties) => updates.push([id, properties]),
    move: async (id, properties) => moves.push([id, properties])
  }
};

await import("./background.js");

function setActive(index, length = 3) {
  tabs = Array.from({ length }, (_, tabIndex) => ({
    id: tabIndex + 10,
    index: tabIndex,
    active: tabIndex === index,
    width: 1390,
    height: 780
  }));
  updates = [];
  moves = [];
}

setActive(1);
await listener("arrow-left");
assert.deepEqual(updates, [[10, { active: true }]]);

setActive(2);
await listener("arrow-right");
assert.deepEqual(updates, [[10, { active: true }]]);

settings.wrapSwitching = false;
setActive(0);
await listener("arrow-left");
assert.deepEqual(updates, []);

setActive(1);
await listener("arrow-up");
assert.deepEqual(moves, [[11, { index: 0 }]]);

setActive(2);
await listener("arrow-down");
assert.deepEqual(moves, []);

setActive(0, 1);
await listener("arrow-right");
await listener("arrow-down");
assert.deepEqual(updates, []);
assert.deepEqual(moves, []);

settings = { layoutMode: "auto", presetId: "adaptive", wrapSwitching: true };
setActive(1);
tabs = tabs.map((tab) => ({ ...tab, width: 1200, height: 700 }));
await listener("arrow-left");
assert.equal(popupOpens, 1);
assert.deepEqual(popupOptions, { windowId: 42 });
assert.deepEqual(updates, []);
assert.deepEqual(moves, []);

windowFocused = false;
await listener("arrow-left");
assert.equal(popupOpens, 1);
assert.deepEqual(badgeTexts, [{ tabId: 11, text: "?" }]);

console.log("background command checks passed");
