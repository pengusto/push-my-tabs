import assert from "node:assert/strict";

let listener;
let runtimeListener;
let settings = { layoutMode: "horizontal", presetId: "adaptive", wrapSwitching: true };
let tabs = [];
let updates = [];
let moves = [];
let history = [];
let creations = [];
let duplicates = [];
let windowCreates = [];
let windowUpdates = [];
let popupOpens = 0;
let popupOptions;
let popupFailure = false;
let badgeTexts = [];
let windowFocused = true;
let lastFocusedWindowId = 42;
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
  runtime: { onMessage: { addListener: (value) => { runtimeListener = value; } } },
  storage: { local: { get: async (defaults) => ({ ...defaults, ...settings }) } },
  windows: {
    getAll: async () => [{ id: 41, tabs: [{ id: 9, active: true }] }, { id: 42, tabs }, { id: 43, tabs: [{ id: 13, active: true }] }],
    get: async (id) => ({ id, focused: id === lastFocusedWindowId, width: 1400, height: 900, tabs: id === 42 ? tabs : [] }),
    getLastFocused: async () => ({ id: lastFocusedWindowId, focused: windowFocused, width: 1400, height: 900, tabs: lastFocusedWindowId === 42 ? tabs : [] }),
    update: async (id, properties) => windowUpdates.push([id, properties]),
    create: async (properties) => windowCreates.push(properties)
  },
  tabs: {
    get: async (id) => {
      const tab = tabs.find((tab) => tab.id === id);
      if (!tab) throw new Error(`No tab with id: ${id}`);
      return tab;
    },
    onActivated: { addListener: (value) => { activatedListener = value; } },
    onRemoved: { addListener: (value) => { removedListener = value; } },
    query: async ({ windowId }) => tabs.filter((tab) => windowId === 42),
    goBack: async (id) => history.push([id, "back"]),
    goForward: async (id) => history.push([id, "forward"]),
    create: async (properties) => creations.push(properties),
    duplicate: async (id) => duplicates.push(id),
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
  duplicates = [];
  windowCreates = [];
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
setActive(1);
lastFocusedWindowId = 99;
await listener("arrow-left", { id: 11, windowId: 42 });
assert.deepEqual(updates, [[10, { active: true }]], "commands use the tab window supplied by Chrome");
lastFocusedWindowId = 42;
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
  { windowId: 42, index: 1, openerTabId: 11 },
  { windowId: 42, index: 2, openerTabId: 11 },
  { windowId: 42, openerTabId: 11 }
]);

setActive(1);
await listener("switch-first");
await listener("switch-last");
assert.deepEqual(updates, [[10, { active: true }], [12, { active: true }]], "first and last tab commands activate the boundaries");

setActive(1);
await listener("move-first");
await listener("move-last");
assert.deepEqual(moves, [[11, { index: 0 }], [11, { index: 2 }]], "first and last tab commands move the active tab");

setActive(1);
tabs[1].pinned = false;
tabs[1].mutedInfo = { muted: false };
await listener("duplicate-tab");
await listener("toggle-pin");
await listener("toggle-mute");
await listener("move-to-new-window");
assert.deepEqual(duplicates, [11], "duplicate command uses the active tab");
assert.deepEqual(updates, [[11, { pinned: true }], [11, { muted: true }]], "pin and mute commands toggle the active tab");
assert.deepEqual(windowCreates, [{ tabId: 11 }], "move-to-new-window moves the active tab into a new window");

setActive(1);
await listener("switch-next-window");
await listener("switch-previous-window");
await listener("move-to-next-window");
assert.deepEqual(windowUpdates.slice(0, 3), [[43, { focused: true }], [41, { focused: true }], [43, { focused: true }]], "window commands focus the adjacent windows");
assert.deepEqual(updates.slice(0, 2), [[13, { active: true }], [9, { active: true }]], "window switching activates the target tab");
assert.deepEqual(moves.slice(-1), [[11, { windowId: 43, index: -1 }]], "window move sends the active tab to the next window");

setActive(1);
await runtimeListener({ type: "run-command", command: "switch-first" }, { tab: tabs[1] });
assert.deepEqual(updates, [[10, { active: true }]], "popup commands use the sender tab context");

setActive(1);
settings.closeDirection = "opener-forward";
tabs[1].openerTabId = 10;
await activatedListener({ tabId: 11, windowId: 42 });
tabs.splice(1, 1);
tabs[1].index = 1;
await removedListener(11, { isWindowClosing: false, windowId: 42 });
assert.deepEqual(updates, [[10, { active: true }]], "closing an active child tab returns to its opener");

setActive(1);
settings.closeDirection = "opener-backward";
tabs[1].openerTabId = 12;
await activatedListener({ tabId: 11, windowId: 42 });
tabs.splice(1, 1);
tabs[1].index = 1;
await removedListener(11, { isWindowClosing: false, windowId: 42 });
assert.deepEqual(updates, [[12, { active: true }]], "the opener wins over the configured fallback direction");

setActive(1);
settings.closeDirection = "opener-forward";
tabs[1].openerTabId = 999;
await activatedListener({ tabId: 11, windowId: 42 });
tabs.splice(1, 1);
tabs[1].index = 1;
await removedListener(11, { isWindowClosing: false, windowId: 42 });
assert.deepEqual(updates, [[12, { active: true }]], "missing openers use the configured fallback direction");

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
await activatedListener({ tabId: 999, windowId: 42 });
tabs.splice(1, 1);
await removedListener(11, { isWindowClosing: false, windowId: 42 });
assert.deepEqual(updates, [], "missing activated tabs do not reuse stale active state");

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
