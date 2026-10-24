import {
  api,
  currentContext,
  isIncognitoAllowed,
  layoutDetection,
  loadSettings,
  recommendedAmbiguousLayout
} from "./api.js";
import { initializeI18n, localizeDocument, message } from "./i18n.js";
import { ACTIONS, COMMANDS, RECENT_TAB_COMMANDS, saveSiteLayoutHint, selectedAction, siteProfileKey, TAB_ACTION_COMMANDS } from "./layout.js";
import { enhanceSelect } from "./picker.js";

import { createTaskRunner, layoutStatusText, openShortcutSetup } from "./ui.js";

const run = createTaskRunner(document.querySelector("#save-status"), document.querySelector("#retry-save"));
const layoutMode = document.querySelector("#layout-mode");
const preset = document.querySelector("#preset");
const detected = document.querySelector("#detected");
const confirmation = document.querySelector("#layout-confirmation");

const settings = await loadSettings();
await initializeI18n(settings.locale);
localizeDocument();
const commands = await api.commands.getAll();
const commandShortcuts = new Map(commands.map(({ name, shortcut }) => [name, shortcut]));
document.querySelector("#native-layout-help").hidden = Boolean(api.browserSettings?.verticalTabs);
const { window: browserWindow, activeTab } = await currentContext();
if (activeTab?.id) await api.action.setBadgeText({ tabId: activeTab.id, text: "" });
if (activeTab?.incognito && !(await isIncognitoAllowed(activeTab))) {
  document.querySelector("#incognito-warning").hidden = false;
  document.querySelector("#incognito-settings").addEventListener("click", async () => {
    await run(async () => {
      if (api.runtime?.id) await api.tabs.create({ url: `chrome://extensions/?id=${api.runtime.id}` });
    }, { success: null, failure: "actionFailed" });
  });
}
layoutMode.value = settings.layoutMode;
preset.value = settings.presetId;
for (const select of [layoutMode, preset]) enhanceSelect(select);

const detection = await layoutDetection(browserWindow, activeTab, settings);
let layout = detection.layout;
let ambiguousLayout = detection.confidence === "uncertain";
const recommendation = ambiguousLayout ? recommendedAmbiguousLayout(browserWindow, activeTab) : layout;
const displayLayout = recommendation ?? "horizontal";
const recommendationName = message(displayLayout === "vertical" ? "layoutVertical" : "layoutHorizontal");
confirmation.hidden = settings.layoutMode !== "auto" || !ambiguousLayout;

document.querySelector("#layout-confirmation-text").textContent =
  recommendation ? message("layoutUncertain", recommendationName) : message("layoutNeedsConfirmation");
confirmation.querySelector('[data-layout="recommended"]').textContent =
  message("useRecommendation") || `✓ ${recommendationName}`;
confirmation.querySelector('[data-layout="recommended"]').hidden = recommendation == null;
for (const button of confirmation.querySelectorAll("[data-layout]")) {
  button.addEventListener("click", async () => {
    const selectedLayout = button.dataset.layout === "recommended" ? recommendation : button.dataset.layout;
    if (!selectedLayout) return;
    await run(async () => {
      const nextSettings = { ...settings, siteProfiles: { ...settings.siteProfiles } };
      if (saveSiteLayoutHint(nextSettings, activeTab, detection.key, selectedLayout)) {
        await api.storage.local.set({ siteProfiles: nextSettings.siteProfiles });
      } else if (detection.key) {
        await api.storage.local.set({ layoutHints: { ...settings.layoutHints, [detection.key]: selectedLayout } });
      } else {
        await api.storage.local.set({ layoutMode: selectedLayout });
      }
      location.reload();
    });
  });
}

const siteLearning = document.querySelector("#site-learning");
const originProfile = siteProfileKey(activeTab?.url);
const pathProfile = siteProfileKey(activeTab?.url, "path");
const host = originProfile ? new URL(originProfile).host : null;
document.querySelector("#confirmation-scope").textContent = originProfile && detection.key
  ? message("confirmationSite", host)
  : detection.key ? message("confirmationGeometry") : message("confirmationManual");
const profileLayout = settings.layoutMode === "auto"
  ? ambiguousLayout ? recommendation : layout
  : settings.layoutMode;
const canLearn = originProfile && detection.key && profileLayout;
siteLearning.hidden = !canLearn;
if (canLearn) {
  document.querySelector("#site-learning-copy").textContent = message("learnLayoutDescription");
  const siteButton = document.querySelector("#remember-site");
  const pathButton = document.querySelector("#remember-path");
  siteButton.textContent = message("rememberSite", host);
  pathButton.textContent = message("rememberPath");

  for (const [button, scope, profile, label] of [
    [siteButton, "origin", originProfile, host],
    [pathButton, "path", pathProfile, new URL(activeTab.url).pathname]
  ]) {
    const buttonLabel = scope === "origin" ? message("rememberSite", label) : message("rememberPath");
    const savedLayout = settings.siteProfiles[profile]?.[detection.key];
    button.textContent = `${savedLayout ? "✓ " : ""}${buttonLabel}`;
    button.disabled = Boolean(savedLayout);

    button.addEventListener("click", async () => {
      await run(async () => {
        const nextSettings = { ...settings, siteProfiles: { ...settings.siteProfiles } };
        saveSiteLayoutHint(nextSettings, activeTab, detection.key, profileLayout, scope);
        await api.storage.local.set({ siteProfiles: nextSettings.siteProfiles });
        settings.siteProfiles = nextSettings.siteProfiles;
        detection.confidence = "remembered";
        layout = profileLayout;
        ambiguousLayout = false;
        confirmation.hidden = true;
        showLayout();
        button.textContent = `✓ ${buttonLabel}`;
        button.disabled = true;
      });
    });
  }
}

function showLayout() {
  const activeLayout = settings.layoutMode === "auto" ? layout : settings.layoutMode;
  const statusLayout = settings.layoutMode === "auto" && ambiguousLayout ? recommendation : activeLayout;
  const layoutIcon = statusLayout === "vertical" ? "↕" : "↔";
  const statusText = layoutStatusText(settings, detection, statusLayout);
  if (settings.layoutMode === "auto" && ambiguousLayout) {
    detected.textContent = statusText;
  } else {
    const icon = document.createElement("span");
    icon.className = "layout-status-icon";
    icon.textContent = layoutIcon;
    icon.setAttribute("aria-hidden", "true");
    detected.replaceChildren(icon, document.createTextNode(statusText));
  }

  const previewSettings = settings;
  const previewLayout = settings.layoutMode === "auto" && ambiguousLayout ? displayLayout : activeLayout ?? "horizontal";
  document.querySelector("#mapping-context").hidden = !ambiguousLayout || settings.layoutMode !== "auto";
  document.querySelector("#mapping-context").textContent = message("mappingPreview", message(previewLayout === "vertical" ? "layoutVertical" : "layoutHorizontal"));
  const preview = document.querySelector("#mapping-preview");
  const assignedCount = COMMANDS.filter((command) => commandShortcuts.get(command)).length;
  document.querySelector("#direction-shortcut-status").textContent =
    assignedCount === COMMANDS.length ? `✓ ${assignedCount}/${COMMANDS.length}` : `${assignedCount}/${COMMANDS.length}`;
  preview.replaceChildren(...COMMANDS.map((command) => {
    const row = document.createElement("div");
    const key = document.createElement("kbd");
    key.textContent = commandShortcuts.get(command) || message("shortcutUnassigned");
    key.classList.toggle("is-unassigned", !commandShortcuts.get(command));
    const action = document.createElement("span");
    action.textContent = message(ACTIONS[selectedAction(previewSettings, previewLayout, command)]);
    row.append(key, action);
    return row;
  }));
}
showLayout();

layoutMode.addEventListener("change", () => {
  const value = layoutMode.value;
  run(async () => {
    await api.storage.local.set({ layoutMode: value });
    location.reload();
  });
});
preset.addEventListener("change", () => {
  const value = preset.value;
  run(async () => {
    await api.storage.local.set({ presetId: value });
    settings.presetId = value;
    showLayout();
  });
});
document.querySelector("#options").addEventListener("click", () => run(async () => {
  await api.runtime.openOptionsPage();
  window.close();
}, { success: null, failure: "actionFailed" }));
for (const [id, section] of [["setup-shortcuts", "direction-shortcuts"], ["setup-recent", "recent-shortcuts"]]) {
  document.querySelector(`#${id}`).addEventListener("click", () => run(async () => {
    await openShortcutSetup(section);
    window.close();
  }, { success: null, failure: "actionFailed" }));
}
const recentShortcuts = document.querySelector("#recent-shortcuts");
for (const command of RECENT_TAB_COMMANDS.map((name) => commands.find((command) => command.name === name)).filter(Boolean)) {
  const row = document.createElement("div");
  const key = document.createElement("kbd");
  key.textContent = command.shortcut || message("shortcutUnassigned");
  key.classList.toggle("is-unassigned", !command.shortcut);
  const label = document.createElement("span");
  label.textContent = command.description;
  row.append(key, label);
  recentShortcuts.append(row);
}

const quickActions = document.querySelector("#quick-actions");
for (const command of commands.filter(({ name }) => TAB_ACTION_COMMANDS.includes(name))) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "quick-action";
  button.textContent = command.description;
  button.addEventListener("click", () => run(async () => {
    await api.runtime.sendMessage({ type: "run-command", command: command.name });
    window.close();
  }, { success: null, failure: "actionFailed" }));
  quickActions.append(button);
}
