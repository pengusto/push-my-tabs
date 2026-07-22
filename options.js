import { api, loadSettings } from "./api.js";
import { ACTIONS, COMMANDS } from "./layout.js";

const commandLabels = {
  "arrow-left": "← Links",
  "arrow-right": "→ Rechts",
  "arrow-up": "↑ Oben",
  "arrow-down": "↓ Unten"
};

const settings = await loadSettings();
const layoutMode = document.querySelector("#layout-mode");
const preset = document.querySelector("#preset");
const wrap = document.querySelector("#wrap");
layoutMode.value = settings.layoutMode;
preset.value = settings.presetId;
wrap.checked = settings.wrapSwitching;

layoutMode.addEventListener("change", () => api.storage.local.set({ layoutMode: layoutMode.value }));
preset.addEventListener("change", async () => {
  await api.storage.local.set({ presetId: preset.value });
  showCustomPreset();
});
wrap.addEventListener("change", () => api.storage.local.set({ wrapSwitching: wrap.checked }));

for (const layout of ["horizontal", "vertical"]) {
  const container = document.querySelector(`[data-layout="${layout}"]`);
  for (const command of COMMANDS) {
    const label = document.createElement("label");
    label.textContent = commandLabels[command];
    const select = document.createElement("select");
    for (const [value, text] of Object.entries(ACTIONS)) select.add(new Option(text, value));
    select.value = settings.customPreset[layout][command];
    select.addEventListener("change", async () => {
      settings.customPreset[layout][command] = select.value;
      await api.storage.local.set({ customPreset: settings.customPreset, presetId: "custom" });
      preset.value = "custom";
      showCustomPreset();
    });
    label.append(select);
    container.append(label);
  }
}

function showCustomPreset() {
  document.querySelector("#custom-section").hidden = preset.value !== "custom";
}
showCustomPreset();

const commands = await api.commands.getAll();
const shortcuts = document.querySelector("#shortcuts");
const canEditHere = typeof api.commands.update === "function";
document.querySelector("#shortcut-help").textContent = canEditHere
  ? "Firefox erlaubt die Bearbeitung direkt hier."
  : "Chrome verwaltet Befehlstasten in seiner Erweiterungsseite.";

for (const command of commands.filter(({ name }) => COMMANDS.includes(name))) {
  const row = document.createElement("label");
  row.className = "shortcut-row";
  row.textContent = commandLabels[command.name];
  const input = document.createElement("input");
  input.value = command.shortcut || "";
  input.placeholder = "Nicht belegt";
  input.readOnly = !canEditHere;
  input.addEventListener("change", async () => {
    try {
      await api.commands.update({ name: command.name, shortcut: input.value });
      document.querySelector("#shortcut-status").textContent = "Befehlstaste gespeichert.";
    } catch (error) {
      document.querySelector("#shortcut-status").textContent = error.message;
    }
  });
  row.append(input);
  shortcuts.append(row);
}

document.querySelector("#shortcut-settings").addEventListener("click", async () => {
  if (api.commands.openShortcutSettings) await api.commands.openShortcutSettings();
  else await api.tabs.create({ url: "chrome://extensions/shortcuts" });
});
