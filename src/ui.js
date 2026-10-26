import { api } from "./api.js";
import { message } from "./i18n.js";

// Serialize UI writes so a later selection cannot be overwritten by a slower save.
export function createTaskRunner(status, retry) {
  let queue = Promise.resolve();
  function run(task, { success = "settingsSaved", failure = "settingsSaveFailed" } = {}) {
    const result = queue.then(async () => {
      status.hidden = false;
      status.textContent = message("savePending");
      retry.hidden = true;
      try {
        await task();
        status.textContent = success ? message(success) : "";
        status.hidden = !success;
        return true;
      } catch (error) {
        console.warn("Push My Tabs action failed:", error);
        status.textContent = message(failure, error.message);
        retry.hidden = false;
        retry.onclick = () => run(task, { success, failure });
        return false;
      }
    });
    queue = result;
    return result;
  }
  return run;
}

export async function openShortcutSetup(section = "direction-shortcuts") {
  if (typeof api.commands.update === "function") {
    await api.tabs.create({ url: api.runtime.getURL(`options.html#${section}`) });
  } else {
    await api.tabs.create({ url: "chrome://extensions/shortcuts" });
  }
}

export function recommendedShortcuts(platform) {
  const mac = platform.toLowerCase().includes("mac");
  if (!mac && !/win|linux|cros|bsd/.test(platform.toLowerCase())) return {};
  const modifier = mac ? "Command" : "Alt";
  return {
    "arrow-left": `${modifier}+Left`,
    "arrow-right": `${modifier}+Right`,
    "arrow-up": `${modifier}+Up`,
    "arrow-down": `${modifier}+Down`,
    "new-tab-after": "Alt+T",
    "recent-tab-switch": "Alt+S",
    "recent-tab-switch-reverse": "Alt+Shift+S"
  };
}

export function layoutStatusText(settings, detection, previewLayout = detection.layout) {
  const layout = settings.layoutMode === "auto" ? previewLayout : settings.layoutMode;
  if (!layout) return message("layoutNeedsConfirmation");
  const name = message(layout === "vertical" ? "layoutVertical" : "layoutHorizontal");
  if (settings.layoutMode !== "auto" || detection.confidence === "remembered") {
    return message("layoutForced", name);
  }
  return detection.confidence === "exact"
    ? message("layoutDetected", name)
    : message("layoutEstimated", name);
}
