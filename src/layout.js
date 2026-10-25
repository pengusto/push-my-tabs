export const COMMANDS = ["arrow-left", "arrow-right", "arrow-up", "arrow-down"];
export const HISTORY_COMMANDS = ["history-back", "history-forward"];
export const TAB_CREATION_COMMANDS = ["new-tab-before", "new-tab-after", "new-tab-end"];
export const RECENT_TAB_COMMANDS = ["recent-tab-switch", "recent-tab-switch-reverse", "recent-tab-quick-switch"];
export const TAB_ACTION_COMMANDS = [
  "switch-first",
  "switch-last",
  "move-first",
  "move-last",
  "duplicate-tab",
  "toggle-pin",
  "toggle-mute",
  "move-to-new-window",
  "switch-next-window",
  "switch-previous-window",
  "move-to-next-window"
];

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
  closeDirection: "browser",
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

export function geometryLayoutHint(hints, key) {
  const measures = (value) => {
    if (!/^-?\d+:-?\d+$/.test(value)) return null;
    return value.split(":").map(Number);
  };
  const current = measures(key);
  if (!current) return null;
  const validLayout = (layout) => ["horizontal", "vertical"].includes(layout);
  // A confirmed exact measurement takes precedence over nearby measurements.
  if (validLayout(hints?.[key])) return { layout: hints[key], confidence: "remembered" };

  const matches = new Set();
  for (const [savedKey, layout] of Object.entries(hints ?? {})) {
    const saved = measures(savedKey);
    if (!saved || !validLayout(layout)) continue;
    // One 20px rounding step in one dimension only. Never learn from a match:
    // otherwise repeated small changes could drift into another real layout.
    const distance = Math.abs(saved[0] - current[0]) + Math.abs(saved[1] - current[1]);
    if (distance <= 20) matches.add(layout);
  }
  if (!matches.size) return null;
  return matches.size === 1
    ? { layout: [...matches][0], confidence: "remembered" }
    : { layout: null, confidence: "uncertain" };
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
