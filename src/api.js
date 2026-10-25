import { DEFAULT_SETTINGS, detectLayout, geometryKey, geometryLayoutHint, siteLayoutHint } from "./layout.js";

export const api = globalThis.browser ?? globalThis.chrome;

export async function loadSettings() {
  const saved = await api.storage.local.get(DEFAULT_SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    closeDirection: ["backward", "forward"].includes(saved.closeDirection) ? saved.closeDirection : DEFAULT_SETTINGS.closeDirection,
    layoutHints: { ...DEFAULT_SETTINGS.layoutHints, ...saved.layoutHints },
    siteProfiles: { ...DEFAULT_SETTINGS.siteProfiles, ...saved.siteProfiles },
    customPreset: {
      horizontal: { ...DEFAULT_SETTINGS.customPreset.horizontal, ...saved.customPreset?.horizontal },
      vertical: { ...DEFAULT_SETTINGS.customPreset.vertical, ...saved.customPreset?.vertical }
    }
  };
}

export function updateCommandShortcut(name, shortcut) {
  return api.commands.update({ name, shortcut });
}

export async function isIncognitoAllowed(tab) {
  if (!tab?.incognito || !api.extension?.isAllowedIncognitoAccess) return true;
  return api.extension.isAllowedIncognitoAccess().catch(() => true);
}

export async function currentContext(tab) {
  const window = tab?.windowId != null
    ? await api.windows.get(tab.windowId, { populate: true })
    : await api.windows.getLastFocused({ populate: true });
  const tabs = window.tabs ?? [];
  const activeTab = tab?.id != null
    ? tabs.find(({ id }) => id === tab.id) ?? tab
    : tabs.find((tab) => tab.active);
  return { window, tabs, activeTab };
}

export async function detectedLayout(window, activeTab) {
  return (await layoutDetection(window, activeTab)).layout;
}

export async function layoutDetection(window, activeTab, settings = DEFAULT_SETTINGS) {
  let zen = false;
  let nativeFailed = false;
  if (api.browserSettings?.verticalTabs) {
    try {
      // Zen identifies as Firefox, but its own tab bar does not use Firefox's setting.
      const info = await api.runtime.getBrowserInfo();
      zen = info.zen != null;
      if (!zen) {
        const { value } = await api.browserSettings.verticalTabs.get({});
        if (typeof value !== "boolean") throw new Error("Invalid native tab-layout value");
        return { layout: value ? "vertical" : "horizontal", confidence: "exact", key: null };
      }
    } catch (error) {
      console.warn("Could not read native tab layout:", error);
      nativeFailed = true;
    }
  }

  const key = geometryKey(window, activeTab);
  if (!key) return { layout: null, confidence: "uncertain", key: null };
  const siteHint = siteLayoutHint(settings, activeTab, key);
  if (siteHint) return { layout: siteHint, confidence: "remembered", key };
  const geometryHint = geometryLayoutHint(settings.layoutHints, key);
  if (geometryHint) {
    const estimated = detectLayout(window.width, window.height, activeTab.width, activeTab.height);
    // A nearby confirmation must not carry the old orientation across a clear
    // heuristic boundary. Exact confirmations remain explicit overrides.
    if (!settings.layoutHints?.[key] && geometryHint.layout && geometryHint.layout !== estimated && !isLayoutDetectionAmbiguous(window, activeTab)) {
      return { layout: null, confidence: "uncertain", key };
    }
    return { ...geometryHint, key };
  }

  return {
    layout: detectLayout(window.width, window.height, activeTab.width, activeTab.height),
    confidence: zen || nativeFailed || isLayoutDetectionAmbiguous(window, activeTab) ? "uncertain" : "confident",
    key
  };
}

export function isLayoutDetectionAmbiguous(window, activeTab) {
  if (window.width == null || window.height == null || activeTab?.width == null || activeTab.height == null) return true;

  const side = window.width - activeTab.width;
  const top = window.height - activeTab.height;
  // Half a rounding bucket around either threshold is inconclusive, rather
  // than letting a few pixels silently reverse directional commands.
  return (side >= 30 && side <= 50)
    || (side >= 30 && top >= 90 && top <= 110)
    || (side >= 40 && top > 100);
}

export function recommendedAmbiguousLayout(window, activeTab) {
  if (window.width == null || activeTab?.width == null) return null;
  const sideChrome = window.width - activeTab.width;
  return sideChrome / window.width >= 0.16 ? "vertical" : "horizontal";
}
