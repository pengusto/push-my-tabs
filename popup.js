import {
  api,
  currentContext,
  isIncognitoAllowed,
  layoutDetection,
  loadSettings,
  recommendedAmbiguousLayout
} from "./api.js";
import { initializeI18n, localizeDocument, message } from "./i18n.js";
import { ACTIONS, COMMANDS, saveSiteLayoutHint, selectedAction, siteProfileKey, TAB_ACTION_COMMANDS } from "./layout.js";
import { enhanceSelect } from "./picker.js";

const layoutMode = document.querySelector("#layout-mode");
const preset = document.querySelector("#preset");
const detected = document.querySelector("#detected");
const confirmation = document.querySelector("#layout-confirmation");

const settings = await loadSettings();
await initializeI18n(settings.locale);
localizeDocument();
const { window, activeTab } = await currentContext();
if (activeTab?.id) await api.action.setBadgeText({ tabId: activeTab.id, text: "" });
if (activeTab?.incognito && !(await isIncognitoAllowed(activeTab))) {
  document.querySelector("#incognito-warning").hidden = false;
  document.querySelector("#incognito-settings").addEventListener("click", async () => {
    if (api.runtime?.id) await api.tabs.create({ url: `chrome://extensions/?id=${api.runtime.id}` });
  });
}
layoutMode.value = settings.layoutMode;
preset.value = settings.presetId;
for (const select of [layoutMode, preset]) enhanceSelect(select);

const detection = await layoutDetection(window, activeTab, settings);
const layout = detection.layout;
const ambiguousLayout = detection.confidence === "uncertain";
const recommendation = ambiguousLayout ? recommendedAmbiguousLayout(window, activeTab) : layout;
const displayLayout = recommendation ?? "horizontal";
const recommendationName = message(displayLayout === "vertical" ? "layoutVertical" : "layoutHorizontal");
confirmation.hidden = settings.layoutMode !== "auto" || !ambiguousLayout;
document.body.classList.toggle("is-confirming", !confirmation.hidden);
document.querySelector("#layout-confirmation-text").textContent =
  message("layoutUncertain", recommendationName) || `Auto · ${recommendationName} ✓`;
confirmation.querySelector('[data-layout="recommended"]').textContent =
  message("useRecommendation") || `✓ ${recommendationName}`;
confirmation.querySelector('[data-layout="recommended"]').hidden = recommendation == null;
for (const button of confirmation.querySelectorAll("[data-layout]")) {
  button.addEventListener("click", async () => {
    const selectedLayout = button.dataset.layout === "recommended" ? recommendation : button.dataset.layout;
    if (!selectedLayout) return;
    if (saveSiteLayoutHint(settings, activeTab, detection.key, selectedLayout)) {
      await api.storage.local.set({ siteProfiles: settings.siteProfiles });
    } else if (detection.key) {
      settings.layoutHints[detection.key] = selectedLayout;
      await api.storage.local.set({ layoutHints: settings.layoutHints });
    } else {
      await api.storage.local.set({ layoutMode: selectedLayout });
    }
    location.reload();
  });
}

const siteLearning = document.querySelector("#site-learning");
const originProfile = siteProfileKey(activeTab?.url);
const pathProfile = siteProfileKey(activeTab?.url, "path");
const host = originProfile ? new URL(originProfile).host : null;
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
      saveSiteLayoutHint(settings, activeTab, detection.key, profileLayout, scope);
      await api.storage.local.set({ siteProfiles: settings.siteProfiles });
      button.textContent = `✓ ${buttonLabel}`;
      button.disabled = true;
    });
  }
}

function showLayout() {
  const activeLayout = settings.layoutMode === "auto" ? layout : settings.layoutMode;
  const layoutName = message(activeLayout === "vertical" ? "layoutVertical" : "layoutHorizontal");
  const layoutIcon = activeLayout === "vertical" ? "↕" : "↔";
  const statusText = settings.layoutMode === "auto" && ambiguousLayout
    ? message("layoutDetecting")
    : settings.layoutMode === "auto"
    ? message("layoutDetected", layoutName)
    : message("layoutForced", layoutName);
  if (settings.layoutMode === "auto" && ambiguousLayout) {
    detected.textContent = statusText;
  } else {
    const icon = document.createElement("span");
    icon.className = "layout-status-icon";
    icon.textContent = layoutIcon;
    icon.setAttribute("aria-hidden", "true");
    detected.replaceChildren(icon, document.createTextNode(statusText));
  }

  const previewSettings = { ...settings, presetId: preset.value };
  const preview = document.querySelector("#mapping-preview");
  preview.replaceChildren(...COMMANDS.map((command) => {
    const row = document.createElement("div");
    const key = document.createElement("kbd");
    key.textContent = { "arrow-left": "←", "arrow-right": "→", "arrow-up": "↑", "arrow-down": "↓" }[command];
    const action = document.createElement("span");
    action.textContent = message(ACTIONS[selectedAction(previewSettings, activeLayout ?? "horizontal", command)]);
    row.append(key, action);
    return row;
  }));
}
showLayout();

layoutMode.addEventListener("change", () => {
  api.storage.local.set({ layoutMode: layoutMode.value });
  location.reload();
});
preset.addEventListener("change", () => {
  showLayout();
  api.storage.local.set({ presetId: preset.value });
});
document.querySelector("#options").addEventListener("click", async () => {
  try {
    await api.runtime.openOptionsPage();
  } catch (error) {
    console.warn("Could not open settings:", error);
  }
  window.close();
});

const quickActions = document.querySelector("#quick-actions");
const commands = await api.commands.getAll();
for (const command of commands.filter(({ name }) => TAB_ACTION_COMMANDS.includes(name))) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "quick-action";
  button.textContent = command.description;
  button.addEventListener("click", async () => {
    await api.runtime.sendMessage({ type: "run-command", command: command.name });
    window.close();
  });
  quickActions.append(button);
}
