import { DEFAULT_SETTINGS, detectLayout, geometryKey, siteLayoutHint } from "./layout.js";

export const api = globalThis.browser ?? globalThis.chrome;

export async function loadSettings() {
  const saved = await api.storage.local.get(DEFAULT_SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    layoutHints: { ...DEFAULT_SETTINGS.layoutHints, ...saved.layoutHints },
    siteProfiles: { ...DEFAULT_SETTINGS.siteProfiles, ...saved.siteProfiles },
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
  return (await layoutDetection(window, activeTab)).layout;
}

export async function layoutDetection(window, activeTab, settings = DEFAULT_SETTINGS) {
  if (api.browserSettings?.verticalTabs) {
    const { value } = await api.browserSettings.verticalTabs.get({});
    return { layout: value ? "vertical" : "horizontal", confidence: "exact", key: null };
  }

  const key = geometryKey(window, activeTab);
  if (!key) return { layout: null, confidence: "uncertain", key: null };
  const siteHint = siteLayoutHint(settings, activeTab, key);
  if (siteHint) return { layout: siteHint, confidence: "remembered", key };
  if (settings.layoutHints?.[key]) return { layout: settings.layoutHints[key], confidence: "remembered", key };

  return {
    layout: detectLayout(window.width, window.height, activeTab.width, activeTab.height),
    confidence: isLayoutDetectionAmbiguous(window, activeTab) ? "uncertain" : "confident",
    key
  };
}

export function isLayoutDetectionAmbiguous(window, activeTab) {
  if (api.browserSettings?.verticalTabs) return false;
  if (window.width == null || window.height == null || activeTab?.width == null || activeTab.height == null) return true;

  return window.width - activeTab.width >= 40 && window.height - activeTab.height > 100;
}

export function recommendedAmbiguousLayout(window, activeTab) {
  if (window.width == null || activeTab?.width == null) return null;
  const sideChrome = window.width - activeTab.width;
  return sideChrome / window.width >= 0.16 ? "vertical" : "horizontal";
}
