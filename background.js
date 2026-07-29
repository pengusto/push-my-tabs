import { api, currentContext, layoutDetection, loadSettings } from "./api.js";
import { HISTORY_COMMANDS, nextIndex, RECENT_TAB_COMMANDS, selectedAction, TAB_CREATION_COMMANDS } from "./layout.js";

const activeTabs = new Map();
const recentTabIds = [];
let recentCycle = null;

const tabTrackingReady = api.windows.getAll({ populate: true }).then((windows) => {
  for (const window of windows) {
    const tab = window.tabs?.find(({ active }) => active);
    if (tab) activeTabs.set(window.id, tab);
  }
  recentTabIds.push(...windows
    .flatMap(({ tabs = [] }) => tabs)
    .sort((a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0))
    .map(({ id }) => id));
});

api.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  const tab = await api.tabs.get(tabId);
  if (tab) activeTabs.set(windowId, tab);
  rememberTab(tabId);
});

api.tabs.onRemoved.addListener(async (tabId, { isWindowClosing, windowId }) => {
  const recentIndex = recentTabIds.indexOf(tabId);
  if (recentIndex !== -1) recentTabIds.splice(recentIndex, 1);
  recentCycle = null;
  const closedTab = activeTabs.get(windowId);
  if (isWindowClosing || closedTab?.id !== tabId) return;

  const [{ closeDirection }, tabs] = await Promise.all([
    loadSettings(),
    api.tabs.query({ windowId })
  ]);
  const target = tabs.find(({ index }) => index === closedTab.index - (closeDirection === "backward" ? 1 : 0));
  if (target?.id) await api.tabs.update(target.id, { active: true });
});

api.commands.onCommand.addListener(async (command) => {
  if (RECENT_TAB_COMMANDS.includes(command)) {
    await switchRecentTab(command);
    return;
  }

  if (HISTORY_COMMANDS.includes(command)) {
    const { activeTab } = await currentContext();
    if (activeTab) await api.tabs[command === "history-back" ? "goBack" : "goForward"](activeTab.id).catch(() => {});
    return;
  }

  if (TAB_CREATION_COMMANDS.includes(command)) {
    const { activeTab, window } = await currentContext();
    if (!activeTab) return;
    await api.tabs.create(command === "new-tab-end"
      ? { windowId: window.id }
      : { windowId: window.id, index: activeTab.index + (command === "new-tab-after" ? 1 : 0) });
    return;
  }

  const [{ window, tabs, activeTab }, settings] = await Promise.all([currentContext(), loadSettings()]);
  if (!activeTab?.id) return;
  const layoutMode = settings.layoutMode;
  const detection = layoutMode === "auto" ? await layoutDetection(window, activeTab, settings) : null;

  if (detection?.confidence === "uncertain") {
    if (!window.focused) {
      await api.action.setBadgeText({ tabId: activeTab.id, text: "?" });
      return;
    }

    try {
      await api.action.openPopup({ windowId: window.id });
    } catch (error) {
      console.warn("Could not open layout confirmation:", error);
      await api.action.setBadgeText({ tabId: activeTab.id, text: "?" });
    }
    return;
  }

  const layout = detection?.layout ?? layoutMode;
  if (!layout) return;
  const action = selectedAction(settings, layout, command);
  const offset = action.endsWith("Backward") ? -1 : 1;

  if (action === "historyBack" || action === "historyForward") {
    await api.tabs[action === "historyBack" ? "goBack" : "goForward"](activeTab.id).catch(() => {});
  } else if (tabs.length < 2) {
    return;
  } else if (action.startsWith("switch")) {
    const index = nextIndex(activeTab.index, offset, tabs.length, settings.wrapSwitching);
    const target = tabs[index];
    if (target?.id && target.id !== activeTab.id) await api.tabs.update(target.id, { active: true });
  } else if (action.startsWith("move")) {
    const index = nextIndex(activeTab.index, offset, tabs.length, false);
    if (index !== activeTab.index) await api.tabs.move(activeTab.id, { index });
  }
});

function rememberTab(tabId) {
  if (tabId == null) return;
  const index = recentTabIds.indexOf(tabId);
  if (index !== -1) recentTabIds.splice(index, 1);
  recentTabIds.unshift(tabId);
}

async function switchRecentTab(command) {
  await tabTrackingReady;
  if (recentTabIds.length < 2) return;

  const now = Date.now();
  const quick = command === "recent-tab-quick-switch";
  const family = quick ? "quick" : "normal";
  const timeout = quick ? 250 : 1000;
  if (!recentCycle || recentCycle.family !== family || now - recentCycle.lastUsed > timeout) {
    recentCycle = { family, ids: [...recentTabIds], index: 0, lastUsed: now };
  }

  const direction = command === "recent-tab-switch-reverse" ? -1 : 1;
  recentCycle.index = (recentCycle.index + direction + recentCycle.ids.length) % recentCycle.ids.length;
  recentCycle.lastUsed = now;
  const target = await api.tabs.get(recentCycle.ids[recentCycle.index]).catch(() => null);
  if (!target?.id) return;
  await api.tabs.update(target.id, { active: true });
  if (target.windowId != null) await api.windows.update(target.windowId, { focused: true });
}
