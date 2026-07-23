import { api, loadSettings } from "./api.js";
import { initializeI18n, localizeDocument, message } from "./i18n.js";
import { ACTIONS, COMMANDS } from "./layout.js";
import { enhanceSelect } from "./picker.js";

const settings = await loadSettings();
await initializeI18n(settings.locale);
localizeDocument();

const commandLabels = {
  "arrow-left": `← ${message("directionLeft")}`,
  "arrow-right": `→ ${message("directionRight")}`,
  "arrow-up": `↑ ${message("directionUp")}`,
  "arrow-down": `↓ ${message("directionDown")}`
};

const language = document.querySelector("#language");
const layoutMode = document.querySelector("#layout-mode");
const preset = document.querySelector("#preset");
const wrap = document.querySelector("#wrap");
language.querySelector('[value="browser"]').textContent = `${message("languageBrowser").replace(/^🌐\s*/, "")} (Browser language)`;
language.value = settings.locale;
layoutMode.value = settings.layoutMode;
preset.value = settings.presetId;
wrap.checked = settings.wrapSwitching;

language.addEventListener("change", async () => {
  await api.storage.local.set({ locale: language.value });
  location.reload();
});
layoutMode.addEventListener("change", () => api.storage.local.set({ layoutMode: layoutMode.value }));
preset.addEventListener("change", async () => {
  await api.storage.local.set({ presetId: preset.value });
  showCustomPreset();
});
wrap.addEventListener("change", () => api.storage.local.set({ wrapSwitching: wrap.checked }));
for (const select of [language, layoutMode, preset]) enhanceSelect(select);

for (const layout of ["horizontal", "vertical"]) {
  const container = document.querySelector(`[data-layout="${layout}"]`);
  for (const command of COMMANDS) {
    const label = document.createElement("label");
    label.textContent = commandLabels[command];
    const select = document.createElement("select");
    for (const [value, messageName] of Object.entries(ACTIONS)) select.add(new Option(message(messageName), value));
    select.value = settings.customPreset[layout][command];
    select.addEventListener("change", async () => {
      settings.customPreset[layout][command] = select.value;
      await api.storage.local.set({ customPreset: settings.customPreset });
      preset.value = "custom";
      preset.dispatchEvent(new Event("change"));
    });
    label.append(select);
    container.append(label);
    enhanceSelect(select);
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
  ? message("shortcutHelpFirefox")
  : message("shortcutHelpChrome");

for (const command of commands.filter(({ name }) => COMMANDS.includes(name))) {
  const row = document.createElement("label");
  row.className = "shortcut-row";
  row.textContent = commandLabels[command.name];
  const input = document.createElement("input");
  const unassigned = !command.shortcut;
  input.value = command.shortcut || (canEditHere ? "" : message("shortcutUnassigned"));
  input.placeholder = message("shortcutUnassigned");
  input.readOnly = !canEditHere;
  input.classList.toggle("is-unassigned", unassigned);
  input.setAttribute("aria-label", `${commandLabels[command.name]}: ${command.shortcut || message("shortcutUnassigned")}`);
  input.addEventListener("change", async () => {
    try {
      await api.commands.update({ name: command.name, shortcut: input.value });
      document.querySelector("#shortcut-status").textContent = message("shortcutSaved");
    } catch (error) {
      document.querySelector("#shortcut-status").textContent = message("shortcutSaveFailed", error.message);
    }
  });
  row.append(input);
  shortcuts.append(row);
}

document.querySelector("#shortcut-settings").addEventListener("click", async () => {
  if (api.commands.openShortcutSettings) await api.commands.openShortcutSettings();
  else await api.tabs.create({ url: "chrome://extensions/shortcuts" });
});
