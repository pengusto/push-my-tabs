import { api, loadSettings, updateCommandShortcut } from "./api.js";
import { initializeI18n, localizeDocument, message } from "./i18n.js";
import { ACTIONS, COMMANDS, HISTORY_COMMANDS, RECENT_TAB_COMMANDS, TAB_ACTION_COMMANDS, TAB_CREATION_COMMANDS } from "./layout.js";
import { enhanceSelect } from "./picker.js";

const settings = await loadSettings();
await initializeI18n(settings.locale);
localizeDocument();
document.querySelector("#native-layout-help").hidden = Boolean(api.browserSettings?.verticalTabs);

const commandLabels = {
  "arrow-left": `← ${message("directionLeft")} — ${message("commandLeftDescription")}`,
  "arrow-right": `→ ${message("directionRight")} — ${message("commandRightDescription")}`,
  "arrow-up": `↑ ${message("directionUp")} — ${message("commandUpDescription")}`,
  "arrow-down": `↓ ${message("directionDown")} — ${message("commandDownDescription")}`
};

const language = document.querySelector("#language");
const layoutMode = document.querySelector("#layout-mode");
const preset = document.querySelector("#preset");
const wrap = document.querySelector("#wrap");
const closeDirection = document.querySelector("#close-direction");
language.querySelector('[value="browser"]').textContent = `${message("languageBrowser").replace(/^🌐\s*/, "")} (Browser language)`;
language.value = settings.locale;
layoutMode.value = settings.layoutMode;
preset.value = settings.presetId;
wrap.checked = settings.wrapSwitching;
closeDirection.value = settings.closeDirection;

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
closeDirection.addEventListener("change", () => api.storage.local.set({ closeDirection: closeDirection.value }));
for (const select of [language, layoutMode, preset, closeDirection]) enhanceSelect(select);

const siteProfiles = document.querySelector("#site-profiles");
for (const [profile, hints] of Object.entries(settings.siteProfiles).sort(([a], [b]) => a.localeCompare(b))) {
  const row = document.createElement("div");
  row.className = "site-profile";
  const data = document.createElement("div");
  data.className = "site-profile-data";
  const name = document.createElement("code");
  name.textContent = profile;
  const dimensions = document.createElement("div");
  dimensions.className = "site-profile-dimensions";
  for (const [key, layout] of Object.entries(hints)) {
    const dimension = document.createElement("span");
    dimension.textContent = `${layout === "vertical" ? "↕" : "↔"} ${message("geometryMeasure", key.split(":"))}`;
    dimensions.append(dimension);
  }
  data.append(name, dimensions);
  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `${profile} ×`);
  remove.addEventListener("click", async () => {
    delete settings.siteProfiles[profile];
    await api.storage.local.set({ siteProfiles: settings.siteProfiles });
    row.remove();
    document.querySelector("#site-profiles-section").hidden = siteProfiles.children.length === 0;
  });
  row.append(data, remove);
  siteProfiles.append(row);
}
document.querySelector("#site-profiles-section").hidden = siteProfiles.children.length === 0;

const autoDetectionSection = document.querySelector("#auto-detection-section");
autoDetectionSection.hidden = Object.keys(settings.layoutHints).length === 0;
document.querySelector("#clear-layout-hints").addEventListener("click", async () => {
  settings.layoutHints = {};
  await api.storage.local.set({ layoutHints: {} });
  autoDetectionSection.hidden = true;
});

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
const supportedCommands = commands.filter(({ name }) => [
  ...COMMANDS, ...HISTORY_COMMANDS, ...TAB_CREATION_COMMANDS, ...RECENT_TAB_COMMANDS, ...TAB_ACTION_COMMANDS
].includes(name));
const unassignedCount = supportedCommands.filter(({ shortcut }) => !shortcut).length;
document.querySelector("#shortcut-summary").textContent = unassignedCount
  ? `${unassignedCount} × ${message("shortcutUnassigned")}`
  : message("shortcutAllAssigned");
const isMac = navigator.platform.toLowerCase().includes("mac");
const recommendedShortcuts = isMac ? {
  "arrow-left": "⌘←",
  "arrow-right": "⌘→",
  "arrow-up": "⌘↑",
  "arrow-down": "⌘↓",
  "history-back": "⌘⌥↓",
  "history-forward": "⌘⌥↑",
  "new-tab-before": "⌥H",
  "new-tab-after": "⌥T",
  "new-tab-end": "⌥E",
  "recent-tab-quick-switch": "⌥W",
  "recent-tab-switch": "⌥S",
  "recent-tab-switch-reverse": "⌥⇧S"
} : {
  "arrow-left": "Alt+Left",
  "arrow-right": "Alt+Right",
  "arrow-up": "Alt+Up",
  "arrow-down": "Alt+Down",
  "history-back": "Alt+Shift+Down",
  "history-forward": "Alt+Shift+Up",
  "new-tab-before": "Alt+H",
  "new-tab-after": "Alt+T",
  "new-tab-end": "Alt+E",
  "recent-tab-quick-switch": "Alt+W",
  "recent-tab-switch": "Alt+S",
  "recent-tab-switch-reverse": "Alt+Shift+S"
};
document.querySelector("#shortcut-help").textContent = canEditHere
  ? message("shortcutHelpFirefox")
  : message("shortcutHelpChrome");

for (const command of supportedCommands) {
  const row = document.createElement("label");
  row.className = "shortcut-row";
  const name = document.createElement("span");
  name.className = "shortcut-name";
  name.textContent = commandLabels[command.name] ?? command.description;
  const recommendation = document.createElement("small");
  recommendation.textContent = `${message("useRecommendation")}: ${recommendedShortcuts[command.name]}`;
  name.append(recommendation);
  const input = document.createElement("input");
  const unassigned = !command.shortcut;
  input.value = command.shortcut || (canEditHere ? "" : message("shortcutUnassigned"));
  input.placeholder = message("shortcutUnassigned");
  input.readOnly = !canEditHere;
  input.classList.toggle("is-unassigned", unassigned);
  input.setAttribute("aria-label", `${commandLabels[command.name] ?? command.description}: ${command.shortcut || message("shortcutUnassigned")}`);
  input.addEventListener("change", async () => {
    try {
      await updateCommandShortcut(command.name, input.value);
      document.querySelector("#shortcut-status").textContent = message("shortcutSaved");
    } catch (error) {
      document.querySelector("#shortcut-status").textContent = message("shortcutSaveFailed", error.message);
    }
  });
  row.append(name, input);
  shortcuts.append(row);
}

document.querySelector("#shortcut-settings").addEventListener("click", async () => {
  if (api.commands.openShortcutSettings) await api.commands.openShortcutSettings();
  else await api.tabs.create({ url: "chrome://extensions/shortcuts" });
});
