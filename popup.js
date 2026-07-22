import { api, currentContext, detectedLayout, loadSettings } from "./api.js";
import { ACTIONS, COMMANDS, selectedAction } from "./layout.js";

const layoutMode = document.querySelector("#layout-mode");
const preset = document.querySelector("#preset");
const detected = document.querySelector("#detected");

const [settings, { window, activeTab }] = await Promise.all([loadSettings(), currentContext()]);
layoutMode.value = settings.layoutMode;
preset.value = settings.presetId;

const layout = await detectedLayout(window, activeTab);
function showLayout() {
  const activeLayout = layoutMode.value === "auto" ? layout : layoutMode.value;
  detected.textContent = layoutMode.value === "auto"
    ? `${activeLayout === "vertical" ? "Vertikal" : "Horizontal"} erkannt`
    : `${activeLayout === "vertical" ? "Vertikal" : "Horizontal"} erzwungen`;

  const previewSettings = { ...settings, presetId: preset.value };
  const preview = document.querySelector("#mapping-preview");
  preview.replaceChildren(...COMMANDS.map((command) => {
    const row = document.createElement("div");
    const key = document.createElement("kbd");
    key.textContent = { "arrow-left": "←", "arrow-right": "→", "arrow-up": "↑", "arrow-down": "↓" }[command];
    const action = document.createElement("span");
    action.textContent = ACTIONS[selectedAction(previewSettings, activeLayout, command)];
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
