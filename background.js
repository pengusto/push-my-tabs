import { api, currentContext, detectedLayout, loadSettings } from "./api.js";
import { nextIndex, selectedAction } from "./layout.js";

api.commands.onCommand.addListener(async (command) => {
  const [{ window, tabs, activeTab }, settings] = await Promise.all([currentContext(), loadSettings()]);
  if (!activeTab?.id || tabs.length < 2) return;

  const layout = settings.layoutMode === "auto"
    ? await detectedLayout(window, activeTab)
    : settings.layoutMode;
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
