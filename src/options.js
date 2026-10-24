import { api, loadSettings, updateCommandShortcut } from "./api.js";
import { initializeI18n, localizeDocument, message } from "./i18n.js";
import { ACTIONS, COMMANDS, HISTORY_COMMANDS, RECENT_TAB_COMMANDS, selectedAction, TAB_ACTION_COMMANDS, TAB_CREATION_COMMANDS } from "./layout.js";
import { enhanceSelect } from "./picker.js";

import { createTaskRunner, recommendedShortcuts } from "./ui.js";

const run = createTaskRunner(document.querySelector("#save-status"), document.querySelector("#retry-save"));
const effectLabels = new Map();
const shortcutInputs = new Map();
const settings = await loadSettings();
await initializeI18n(settings.locale);
localizeDocument();
document.querySelector("#native-layout-help").hidden = Boolean(api.browserSettings?.verticalTabs);

const commandLabels = {
  "arrow-left": `← ${message("directionLeft")}`,
  "arrow-right": `→ ${message("directionRight")}`,
  "arrow-up": `↑ ${message("directionUp")}`,
  "arrow-down": `↓ ${message("directionDown")}`
};

function showEffects() {
  for (const [command, label] of effectLabels) {
    const horizontal = message(ACTIONS[selectedAction(settings, "horizontal", command)]);
    const vertical = message(ACTIONS[selectedAction(settings, "vertical", command)]);
    label.textContent = settings.layoutMode === "horizontal" ? horizontal
      : settings.layoutMode === "vertical" ? vertical
      : horizontal === vertical ? horizontal
      : `${message("layoutHorizontal")}: ${horizontal} · ${message("layoutVertical")}: ${vertical}`;
  }
}

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

function saveSetting(control, key, reload = false) {
  control.addEventListener("change", () => {
    const value = control.type === "checkbox" ? control.checked : control.value;
    run(async () => {
      await api.storage.local.set({ [key]: value });
      settings[key] = value;
      showCustomPreset();
      showEffects();
      if (reload) location.reload();
    });
  });
}
saveSetting(language, "locale", true);
saveSetting(layoutMode, "layoutMode");
saveSetting(preset, "presetId");
saveSetting(wrap, "wrapSwitching");
saveSetting(closeDirection, "closeDirection");
const syncPreset = enhanceSelect(preset);
for (const select of [language, layoutMode, closeDirection]) enhanceSelect(select);

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
  remove.addEventListener("click", () => run(async () => {
    const nextProfiles = { ...settings.siteProfiles };
    delete nextProfiles[profile];
    await api.storage.local.set({ siteProfiles: nextProfiles });
    settings.siteProfiles = nextProfiles;
    row.remove();
    document.querySelector("#site-profiles-section").hidden = siteProfiles.children.length === 0;
  }));
  row.append(data, remove);
  siteProfiles.append(row);
}
document.querySelector("#site-profiles-section").hidden = siteProfiles.children.length === 0;

const autoDetectionSection = document.querySelector("#auto-detection-section");
autoDetectionSection.hidden = Object.keys(settings.layoutHints).length === 0;
document.querySelector("#clear-layout-hints").addEventListener("click", () => run(async () => {
  await api.storage.local.set({ layoutHints: {} });
  settings.layoutHints = {};
  autoDetectionSection.hidden = true;
}));

for (const layout of ["horizontal", "vertical"]) {
  const container = document.querySelector(`[data-layout="${layout}"]`);
  for (const command of COMMANDS) {
    const label = document.createElement("label");
    label.textContent = commandLabels[command];
    const select = document.createElement("select");
    for (const [value, messageName] of Object.entries(ACTIONS)) select.add(new Option(message(messageName), value));
    select.value = settings.customPreset[layout][command];
    select.addEventListener("change", () => {
      const value = select.value;
      run(async () => {
        const customPreset = {
          ...settings.customPreset,
          [layout]: { ...settings.customPreset[layout], [command]: value }
        };
        await api.storage.local.set({ customPreset, presetId: "custom" });
        settings.customPreset = customPreset;
        settings.presetId = "custom";
        preset.value = "custom";
        syncPreset();
        showCustomPreset();
        showEffects();
      });
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
const optionalShortcuts = document.querySelector("#optional-shortcuts");
const canEditHere = typeof api.commands.update === "function";
const supportedCommands = [
  ...COMMANDS, ...RECENT_TAB_COMMANDS, ...HISTORY_COMMANDS, ...TAB_CREATION_COMMANDS, ...TAB_ACTION_COMMANDS
].map((name) => commands.find((command) => command.name === name)).filter(Boolean);
function showShortcutSummary() {
  const assignedCoreCount = supportedCommands.filter(({ name, shortcut }) => COMMANDS.includes(name) && shortcut).length;
  document.querySelector("#shortcut-summary").textContent =
    assignedCoreCount === COMMANDS.length ? `✓ ${assignedCoreCount}/${COMMANDS.length}` : `${assignedCoreCount}/${COMMANDS.length}`;
}
showShortcutSummary();
const suggestions = recommendedShortcuts(navigator.platform);
document.querySelector("#shortcut-help").textContent = canEditHere
  ? message("shortcutHelpFirefox")
  : message("shortcutHelpChrome");

for (const command of supportedCommands) {
  const row = document.createElement("label");
  row.className = "shortcut-row";
  const name = document.createElement("span");
  name.className = "shortcut-name";
  name.textContent = commandLabels[command.name] ?? command.description;
  if (suggestions[command.name]) {
    const recommendation = document.createElement("small");
    recommendation.textContent = `${message("useRecommendation")}: ${suggestions[command.name]}`;
    name.append(recommendation);
  }
  if (COMMANDS.includes(command.name)) {
    const effect = document.createElement("small");
    effect.className = "effective-action";
    effectLabels.set(command.name, effect);
    name.insertBefore(effect, name.querySelector("small"));
  }
  const input = document.createElement("input");
  const unassigned = !command.shortcut;
  input.value = command.shortcut || (canEditHere ? "" : message("shortcutUnassigned"));
  input.placeholder = message("shortcutUnassigned");
  input.readOnly = !canEditHere;
  shortcutInputs.set(command.name, input);
  input.classList.toggle("is-unassigned", unassigned);
  input.setAttribute("aria-label", `${commandLabels[command.name] ?? command.description}: ${command.shortcut || message("shortcutUnassigned")}`);
  function saveShortcut(value) {
    return run(async () => {
      await updateCommandShortcut(command.name, value);
      command.shortcut = value;
      showShortcutSummary();
      input.value = value;
      input.classList.toggle("is-unassigned", !value);
      input.setAttribute("aria-label", `${commandLabels[command.name] ?? command.description}: ${value || message("shortcutUnassigned")}`);
    }, { success: "shortcutSaved", failure: "shortcutSaveFailed" });
  }
  input.addEventListener("change", () => saveShortcut(input.value));
  const controls = document.createElement("div");
  controls.className = "shortcut-controls";
  controls.append(input);
  if (canEditHere && suggestions[command.name]) {
    const use = document.createElement("button");
    use.type = "button";
    use.textContent = message("useShortcutSuggestion");
    use.addEventListener("click", () => saveShortcut(suggestions[command.name]));
    controls.append(use);
  }
  row.append(name, controls);
  const container = COMMANDS.includes(command.name) ? shortcuts
    : RECENT_TAB_COMMANDS.includes(command.name) ? document.querySelector("#recent-commands")
    : optionalShortcuts;
  container.append(row);
}

showEffects();
const shortcutSettings = document.querySelector("#shortcut-settings");
shortcutSettings.hidden = canEditHere;
shortcutSettings.addEventListener("click", () => run(async () => {
  await api.tabs.create({ url: "chrome://extensions/shortcuts" });
}, { success: null, failure: "actionFailed" }));

// Chrome edits happen in another tab; refresh assignments when the user returns.
window.addEventListener("focus", async () => {
  try {
    const currentCommands = await api.commands.getAll();
    for (const current of currentCommands) {
      const command = supportedCommands.find(({ name }) => name === current.name);
      const input = shortcutInputs.get(current.name);
      if (!command || !input || document.activeElement === input) continue;
      command.shortcut = current.shortcut;
      input.value = current.shortcut || (canEditHere ? "" : message("shortcutUnassigned"));
      input.classList.toggle("is-unassigned", !current.shortcut);
      input.setAttribute("aria-label", `${commandLabels[current.name] ?? current.description}: ${current.shortcut || message("shortcutUnassigned")}`);
    }
    showShortcutSummary();
  } catch (error) {
    console.warn("Could not refresh shortcuts:", error);
  }
});
