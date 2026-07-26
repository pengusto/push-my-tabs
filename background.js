import { api, currentContext, layoutDetection, loadSettings } from "./api.js";
import { nextIndex, selectedAction } from "./layout.js";

api.commands.onCommand.addListener(async (command) => {
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

  if (tabs.length < 2) return;

  const layout = detection?.layout ?? layoutMode;
  if (!layout) return;
  const action = selectedAction(settings, layout, command);
  const offset = action.endsWith("Backward") ? -1 : 1;

  if (action.startsWith("switch")) {
    const index = nextIndex(activeTab.index, offset, tabs.length, settings.wrapSwitching);
    const target = tabs[index];
    if (target?.id && target.id !== activeTab.id) await api.tabs.update(target.id, { active: true });
  } else if (action.startsWith("move")) {
    const index = nextIndex(activeTab.index, offset, tabs.length, false);
    if (index !== activeTab.index) await api.tabs.move(activeTab.id, { index });
  }
});
