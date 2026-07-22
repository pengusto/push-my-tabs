export const COMMANDS = ["arrow-left", "arrow-right", "arrow-up", "arrow-down"];

export const ACTIONS = {
  switchBackward: "actionSwitchBackward",
  switchForward: "actionSwitchForward",
  moveBackward: "actionMoveBackward",
  moveForward: "actionMoveForward",
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
  presetId: "adaptive",
  wrapSwitching: true,
  customPreset: {
    horizontal: { ...horizontal },
    vertical: { ...vertical }
  }
};

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
