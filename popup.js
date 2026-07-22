import { api, currentContext, detectedLayout, loadSettings } from "./api.js";
import { initializeI18n, localizeDocument, message } from "./i18n.js";
import { ACTIONS, COMMANDS, selectedAction } from "./layout.js";
import { enhanceSelect } from "./picker.js";

const layoutMode = document.querySelector("#layout-mode");
const preset = document.querySelector("#preset");
const detected = document.querySelector("#detected");

const settings = await loadSettings();
await initializeI18n(settings.locale);
localizeDocument();
const { window, activeTab } = await currentContext();
layoutMode.value = settings.layoutMode;
preset.value = settings.presetId;
for (const select of [layoutMode, preset]) enhanceSelect(select);

const layout = await detectedLayout(window, activeTab);
function showLayout() {
  const activeLayout = layoutMode.value === "auto" ? layout : layoutMode.value;
  const layoutName = message(activeLayout === "vertical" ? "layoutVertical" : "layoutHorizontal");
  detected.textContent = layoutMode.value === "auto"
    ? message("layoutDetected", layoutName)
    : message("layoutForced", layoutName);

  const previewSettings = { ...settings, presetId: preset.value };
  const preview = document.querySelector("#mapping-preview");
  preview.replaceChildren(...COMMANDS.map((command) => {
    const row = document.createElement("div");
    const key = document.createElement("kbd");
    key.textContent = { "arrow-left": "←", "arrow-right": "→", "arrow-up": "↑", "arrow-down": "↓" }[command];
    const action = document.createElement("span");
    action.textContent = message(ACTIONS[selectedAction(previewSettings, activeLayout, command)]);
    row.append(key, action);
    return row;
  }));
}
showLayout();

layoutMode.addEventListener("change", () => {
  showLayout();
  api.storage.local.set({ layoutMode: layoutMode.value });
});
preset.addEventListener("change", () => {
  showLayout();
  api.storage.local.set({ presetId: preset.value });
});
document.querySelector("#options").addEventListener("click", () => api.runtime.openOptionsPage());
