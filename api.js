import { DEFAULT_SETTINGS, detectLayout } from "./layout.js";

export const api = globalThis.browser ?? globalThis.chrome;

export async function loadSettings() {
  const saved = await api.storage.local.get(DEFAULT_SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    customPreset: {
      horizontal: { ...DEFAULT_SETTINGS.customPreset.horizontal, ...saved.customPreset?.horizontal },
      vertical: { ...DEFAULT_SETTINGS.customPreset.vertical, ...saved.customPreset?.vertical }
    }
  };
}

export async function currentContext() {
  const window = await api.windows.getLastFocused({ populate: true });
  const tabs = window.tabs ?? [];
  const activeTab = tabs.find((tab) => tab.active);
  return { window, tabs, activeTab };
}

export async function detectedLayout(window, activeTab) {
  if (api.browserSettings?.verticalTabs) {
    const { value } = await api.browserSettings.verticalTabs.get({});
    return value ? "vertical" : "horizontal";
  }

  if (window.width == null || window.height == null || activeTab?.width == null || activeTab.height == null) {
    return "horizontal";
  }

  return detectLayout(window.width, window.height, activeTab.width, activeTab.height);
}
