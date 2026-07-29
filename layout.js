export const COMMANDS = ["arrow-left", "arrow-right", "arrow-up", "arrow-down"];
export const HISTORY_COMMANDS = ["history-back", "history-forward"];
export const TAB_CREATION_COMMANDS = ["new-tab-before", "new-tab-after", "new-tab-end"];
export const RECENT_TAB_COMMANDS = ["recent-tab-quick-switch", "recent-tab-switch", "recent-tab-switch-reverse"];

export const ACTIONS = {
  switchBackward: "actionSwitchBackward",
  switchForward: "actionSwitchForward",
  moveBackward: "actionMoveBackward",
  moveForward: "actionMoveForward",
  historyBack: "actionHistoryBack",
  historyForward: "actionHistoryForward",
  none: "actionNone"
};

const horizontal = {
  "arrow-left": "switchBackward",
  "arrow-right": "switchForward",
  "arrow-up": "moveBackward",
  "arrow-down": "moveForward"
};

const vertical = {
  "arrow-left": "moveBackward",
  "arrow-right": "moveForward",
  "arrow-up": "switchBackward",
  "arrow-down": "switchForward"
};

export const PRESETS = {
  adaptive: { horizontal, vertical },
  horizontal: { horizontal, vertical: horizontal },
  vertical: { horizontal: vertical, vertical }
};

export const DEFAULT_SETTINGS = {
  locale: "browser",
  layoutMode: "auto",
  layoutHints: {},
  siteProfiles: {},
  presetId: "adaptive",
  wrapSwitching: true,
  closeDirection: "forward",
  customPreset: {
    horizontal: { ...horizontal },
    vertical: { ...vertical }
  }
};

export function geometryKey(window, tab) {
  if (window?.width == null || window.height == null || tab?.width == null || tab.height == null) return null;
  const round = (value) => Math.round(value / 20) * 20;
  return `${round(window.width - tab.width)}:${round(window.height - tab.height)}`;
}

export function siteOrigin(url) {
  if (!url) return null;
  try {
    const { protocol, host } = new URL(/^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`);
    return host && ["http:", "https:", "chrome:", "chrome-extension:", "moz-extension:"].includes(protocol)
      ? `${protocol}//${host}`
      : null;
  } catch {
    return null;
  }
}

export function siteProfileKey(url, scope = "origin") {
  const origin = siteOrigin(url);
  if (!origin) return null;
  if (scope === "origin") return origin;

  const { pathname } = new URL(url);
  return `${origin}${pathname}`;
}

export function siteLayoutHint(settings, tab, key) {
  if (!key) return null;
  const path = siteProfileKey(tab?.url, "path");
  const origin = siteProfileKey(tab?.url);
  return settings.siteProfiles?.[path]?.[key] ?? settings.siteProfiles?.[origin]?.[key] ?? null;
}

export function saveSiteLayoutHint(settings, tab, key, layout, scope = "origin") {
  const profile = siteProfileKey(tab?.url, scope);
  if (!profile || !key) return false;
  settings.siteProfiles[profile] = { ...settings.siteProfiles[profile], [key]: layout };
  return true;
}

export function detectLayout(windowWidth, windowHeight, tabWidth, tabHeight) {
  const sideChrome = windowWidth - tabWidth;
  const topChrome = windowHeight - tabHeight;

  // ponytail: An open side panel can resemble vertical tabs; the manual layout
  // mode is the upgrade path until Chrome exposes its orientation setting.
  return sideChrome >= 40 && topChrome <= 100 ? "vertical" : "horizontal";
}

export function selectedAction(settings, layout, command) {
  const preset = settings.presetId === "custom"
    ? { horizontal: settings.customPreset.horizontal, vertical: settings.customPreset.vertical }
    : PRESETS[settings.presetId] ?? PRESETS.adaptive;

  return preset[layout]?.[command] ?? "none";
}

export function nextIndex(index, offset, length, wrap) {
  return wrap
    ? (index + offset + length) % length
    : Math.max(0, Math.min(length - 1, index + offset));
}
