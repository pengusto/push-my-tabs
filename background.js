import { api, currentContext, layoutDetection, loadSettings } from "./api.js";
import { HISTORY_COMMANDS, nextIndex, RECENT_TAB_COMMANDS, selectedAction, TAB_ACTION_COMMANDS, TAB_CREATION_COMMANDS } from "./layout.js";

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
}).catch(() => {});

api.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  try {
    activeTabs.set(windowId, await api.tabs.get(tabId));
  } catch {
    activeTabs.delete(windowId);
  }
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
  const useOpener = typeof closeDirection === "string" && closeDirection.startsWith("opener-");
  const direction = typeof closeDirection === "string" && closeDirection.endsWith("backward") ? "backward" : "forward";
  const target = (useOpener ? tabs.find(({ id }) => id === closedTab.openerTabId) : null)
    ?? tabs.find(({ index }) => index === closedTab.index - (direction === "backward" ? 1 : 0));
  if (target?.id) await api.tabs.update(target.id, { active: true });
});

api.commands.onCommand.addListener((command, commandTab) => executeCommand(command, commandTab));
api.runtime?.onMessage?.addListener((message, sender) => {
  if (message?.type !== "run-command" || !TAB_ACTION_COMMANDS.includes(message.command)) return;
  return executeCommand(message.command, sender.tab);
});

async function executeCommand(command, commandTab) {
  if (RECENT_TAB_COMMANDS.includes(command)) {
    await switchRecentTab(command);
    return;
  }

  if (HISTORY_COMMANDS.includes(command)) {
    const { activeTab } = await currentContext(commandTab);
    if (activeTab) await api.tabs[command === "history-back" ? "goBack" : "goForward"](activeTab.id).catch(() => {});
    return;
  }

  if (TAB_CREATION_COMMANDS.includes(command)) {
    const { activeTab, window } = await currentContext(commandTab);
    if (!activeTab) return;
    await api.tabs.create(command === "new-tab-end"
      ? { windowId: window.id, openerTabId: activeTab.id }
      : { windowId: window.id, index: activeTab.index + (command === "new-tab-after" ? 1 : 0), openerTabId: activeTab.id });
    return;
  }

  if (TAB_ACTION_COMMANDS.includes(command)) {
    const { activeTab, tabs, window } = await currentContext(commandTab);
    if (!activeTab?.id) return;

    if (command === "switch-first" || command === "switch-last") {
      const target = command === "switch-first" ? tabs[0] : tabs.at(-1);
      if (target?.id && target.id !== activeTab.id) await api.tabs.update(target.id, { active: true }).catch(() => {});
    } else if (command === "move-first" || command === "move-last") {
      const index = command === "move-first" ? 0 : Math.max(0, tabs.length - 1);
      if (index !== activeTab.index) await api.tabs.move(activeTab.id, { index }).catch(() => {});
    } else if (command === "duplicate-tab") {
      if (api.tabs.duplicate) await api.tabs.duplicate(activeTab.id).catch(() => {});
    } else if (command === "toggle-pin") {
      await api.tabs.update(activeTab.id, { pinned: !activeTab.pinned }).catch(() => {});
    } else if (command === "toggle-mute") {
      await api.tabs.update(activeTab.id, { muted: !activeTab.mutedInfo?.muted }).catch(() => {});
    } else if (command === "move-to-new-window") {
      if (api.windows.create) await api.windows.create({ tabId: activeTab.id }).catch(() => {});
    } else if (command === "switch-next-window" || command === "switch-previous-window") {
      const target = await adjacentWindow(window.id, command === "switch-next-window" ? 1 : -1);
      const targetTab = target?.tabs?.find(({ active }) => active) ?? target?.tabs?.[0];
      if (target?.id != null) await api.windows.update(target.id, { focused: true }).catch(() => {});
      if (targetTab?.id != null) await api.tabs.update(targetTab.id, { active: true }).catch(() => {});
    } else if (command === "move-to-next-window") {
      const target = await adjacentWindow(window.id, 1);
      if (target?.id != null) {
        await api.tabs.move(activeTab.id, { windowId: target.id, index: -1 }).catch(() => {});
        await api.windows.update(target.id, { focused: true }).catch(() => {});
      }
    }
    return;
  }

  const [{ window, tabs, activeTab }, settings] = await Promise.all([currentContext(commandTab), loadSettings()]);
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
}

async function adjacentWindow(currentWindowId, direction) {
  const windows = await api.windows.getAll({ populate: true }).catch(() => []);
  const candidates = windows.filter(({ type }) => !type || type === "normal");
  if (candidates.length < 2) return null;
  const currentIndex = candidates.findIndex(({ id }) => id === currentWindowId);
  if (currentIndex === -1) return candidates[direction === 1 ? 0 : candidates.length - 1];
  return candidates[(currentIndex + direction + candidates.length) % candidates.length];
}

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
