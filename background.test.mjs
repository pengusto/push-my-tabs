import assert from "node:assert/strict";

let listener;
let settings = { layoutMode: "horizontal", presetId: "adaptive", wrapSwitching: true };
let tabs = [];
let updates = [];
let moves = [];
let history = [];
let creations = [];
let windowUpdates = [];
let popupOpens = 0;
let popupOptions;
let popupFailure = false;
let badgeTexts = [];
let windowFocused = true;
let activatedListener;
let removedListener;

globalThis.chrome = {
  action: {
    openPopup: async (options) => {
      popupOpens += 1;
      popupOptions = options;
      if (popupFailure) throw new Error("popup unavailable");
    },
    setBadgeText: async (details) => badgeTexts.push(details)
  },
  commands: { onCommand: { addListener: (value) => { listener = value; } } },
  storage: { local: { get: async (defaults) => ({ ...defaults, ...settings }) } },
  windows: {
    getAll: async () => [{ id: 42, tabs }],
    getLastFocused: async () => ({ id: 42, focused: windowFocused, width: 1400, height: 900, tabs }),
    update: async (id, properties) => windowUpdates.push([id, properties])
  },
  tabs: {
    get: async (id) => tabs.find((tab) => tab.id === id),
    onActivated: { addListener: (value) => { activatedListener = value; } },
    onRemoved: { addListener: (value) => { removedListener = value; } },
    query: async ({ windowId }) => tabs.filter((tab) => windowId === 42),
    goBack: async (id) => history.push([id, "back"]),
    goForward: async (id) => history.push([id, "forward"]),
    create: async (properties) => creations.push(properties),
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
    height: 780,
    url: "https://example.com/page"
  }));
  updates = [];
  moves = [];
  history = [];
  creations = [];
  windowUpdates = [];
}

setActive(0);
tabs[1].windowId = 7;
await activatedListener({ tabId: 10, windowId: 42 });
await activatedListener({ tabId: 11, windowId: 7 });
await activatedListener({ tabId: 12, windowId: 42 });
await listener("recent-tab-quick-switch");
await listener("recent-tab-quick-switch");
assert.deepEqual(updates, [[11, { active: true }], [10, { active: true }]], "quick switching cycles through MRU tabs");
assert.deepEqual(windowUpdates[0], [7, { focused: true }], "MRU switching focuses tabs in other windows");
await listener("recent-tab-switch");
await listener("recent-tab-switch-reverse");
assert.deepEqual(updates.slice(-2), [[11, { active: true }], [12, { active: true }]], "normal MRU switching can reverse direction");

setActive(1);
await listener("history-back");
await listener("history-forward");
assert.deepEqual(history, [[11, "back"], [11, "forward"]]);

setActive(1);
await listener("new-tab-before");
await listener("new-tab-after");
await listener("new-tab-end");
assert.deepEqual(creations, [
  { windowId: 42, index: 1 },
  { windowId: 42, index: 2 },
  { windowId: 42 }
]);

setActive(1);
await activatedListener({ tabId: 11, windowId: 42 });
tabs.splice(1, 1);
tabs[1].index = 1;
await removedListener(11, { isWindowClosing: false, windowId: 42 });
assert.deepEqual(updates, [[12, { active: true }]], "closing the active tab selects right/down by default");

settings.closeDirection = "backward";
setActive(1);
await activatedListener({ tabId: 11, windowId: 42 });
tabs.splice(1, 1);
tabs[1].index = 1;
await removedListener(11, { isWindowClosing: false, windowId: 42 });
assert.deepEqual(updates, [[10, { active: true }]], "closing the active tab can select left/up");

setActive(1);
await activatedListener({ tabId: 11, windowId: 42 });
tabs.splice(2, 1);
await removedListener(12, { isWindowClosing: false, windowId: 42 });
assert.deepEqual(updates, [], "closing a background tab keeps the active tab");

setActive(1);
await listener("arrow-left");
assert.deepEqual(updates, [[10, { active: true }]]);

settings = {
  layoutMode: "horizontal",
  presetId: "custom",
  customPreset: { horizontal: { "arrow-left": "historyBack", "arrow-right": "historyForward" } }
};
setActive(0, 1);
await listener("arrow-left");
await listener("arrow-right");
assert.deepEqual(history, [[10, "back"], [10, "forward"]], "browser history works with a single tab");

settings = { layoutMode: "horizontal", presetId: "adaptive", wrapSwitching: true };

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
setActive(0, 1);
tabs[0] = { ...tabs[0], width: undefined, height: undefined };
await listener("arrow-right");
assert.equal(popupOpens, 1);

setActive(1);
tabs = tabs.map((tab) => ({ ...tab, width: 1200, height: 700 }));
await listener("arrow-left");
assert.equal(popupOpens, 2);
assert.deepEqual(popupOptions, { windowId: 42 });
assert.deepEqual(updates, []);
assert.deepEqual(moves, []);

windowFocused = false;
await listener("arrow-left");
assert.equal(popupOpens, 2);
assert.deepEqual(badgeTexts, [{ tabId: 11, text: "?" }]);

windowFocused = true;
popupFailure = true;
const warn = console.warn;
console.warn = () => {};
await listener("arrow-left");
console.warn = warn;
assert.deepEqual(badgeTexts.at(-1), { tabId: 11, text: "?" });
popupFailure = false;

settings = {
  layoutMode: "auto",
  siteProfiles: { "https://example.com": { "200:200": "vertical" } },
  presetId: "adaptive",
  wrapSwitching: true
};
setActive(1);
tabs = tabs.map((tab) => ({ ...tab, width: 1200, height: 700 }));
await listener("arrow-up");
assert.deepEqual(updates, [[10, { active: true }]], "site profile resolves ambiguous geometry");

console.log("background command checks passed");
