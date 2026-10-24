import { api } from "./api.js";

export async function platformOS() {
  try {
    return (await api.runtime.getPlatformInfo()).os;
  } catch (error) {
    console.warn("Could not identify shortcut platform:", error);
    return "unknown";
  }
}

export function platformName(os) {
  return { mac: "macOS", win: "Windows", linux: "Linux", cros: "ChromeOS", openbsd: "BSD", android: "Android" }[os] ?? "";
}

const aliases = {
  command: "command", cmd: "command", "⌘": "command",
  ctrl: "control", control: "control", macctrl: "control", strg: "control", "⌃": "control",
  alt: "alt", option: "alt", opt: "alt", "⌥": "alt",
  shift: "shift", "⇧": "shift",
  left: "left", arrowleft: "left", "←": "left",
  right: "right", arrowright: "right", "→": "right",
  up: "up", arrowup: "up", "↑": "up",
  down: "down", arrowdown: "down", "↓": "down"
};
const symbols = { command: "⌘", control: "⌃", alt: "⌥", shift: "⇧", left: "←", right: "→", up: "↑", down: "↓" };
const words = { command: "Command", control: "Ctrl", alt: "Alt", shift: "Shift", left: "←", right: "→", up: "↑", down: "↓" };
const spoken = { command: "Command", control: "Control", alt: "Alt", shift: "Shift", left: "Left", right: "Right", up: "Up", down: "Down" };

// Browser runtime values, not manifest defaults: Ctrl is never guessed to mean Command.
export function shortcutLabel(raw, os, accessible = false) {
  if (!raw?.trim()) return "";
  const parts = raw.trim().replace(/[⌘⌃⌥⇧←→↑↓]/g, (symbol) => `+${symbol}+`).split("+").map((part) => part.trim()).filter(Boolean);
  if (!parts.length || parts.some((part) => !aliases[part.toLowerCase()] && !/^(?:[a-z0-9]|F\d{1,2}|Comma|Period|Home|End|PageUp|PageDown|Space|Insert|Delete|Search|MediaNextTrack|MediaPlayPause|MediaPrevTrack|MediaStop)$/i.test(part))) return raw;
  const labels = accessible ? spoken : os === "mac" ? symbols : words;
  return parts.map((part) => labels[aliases[part.toLowerCase()]] ?? part).join(accessible || os !== "mac" ? "+" : "");
}
