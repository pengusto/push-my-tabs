import { api, currentContext, isIncognitoAllowed, layoutDetection, loadSettings, recommendedAmbiguousLayout, updateCommandShortcut } from "./api.js";
import { ACTIONS, COMMANDS, HISTORY_COMMANDS, RECENT_TAB_COMMANDS, TAB_ACTION_COMMANDS, TAB_CREATION_COMMANDS, saveSiteLayoutHint, selectedAction, siteProfileKey } from "./layout.js";
import { initializeI18n, localizeDocument, message } from "./i18n.js";
import { createTaskRunner, layoutStatusText, recommendedShortcuts } from "./ui.js";
import { platformName, platformOS, shortcutLabel } from "./shortcuts.js";
import { icon } from "./icons.js";

const views = { navigation: "navigationHeading", tabloop: "recentTabsHeading", layout: "layoutHeading", shortcuts: "shortcutsViewHeading", settings: "settingsHeading" };
const recentLabels = { "recent-tab-switch": "recentNormal", "recent-tab-switch-reverse": "recentReverse", "recent-tab-quick-switch": "recentQuick" };
const languages = { browser: "", en: "English", de: "Deutsch", es: "Español", fr: "Français", pt_BR: "Português, Brasil", it: "Italiano", pl: "Polski", tr: "Türkçe", ja: "日本語", zh_CN: "简体中文", ar: "العربية", ru: "Русский", uk: "Українська", ku: "Kurdî, Kurmancî", fa: "فارسی، دری" };
const $ = (selector) => document.querySelector(selector);
const all = (selector) => [...document.querySelectorAll(selector)];

export async function mountApp({ popup }) {
  try {
    const response = await fetch(api.runtime.getURL("app.html"));
    if (!response.ok) throw new Error("Could not load extension interface");
    // Only the packaged template is parsed; all settings and user text use textContent.
    const shell = new DOMParser().parseFromString(await response.text(), "text/html");
    document.body.prepend(...[...shell.body.children].map((node) => document.importNode(node, true)));
    await startApp(popup);
  } catch (error) {
    console.warn("Could not load Push My Tabs:", error);
    const status = $("#save-status") ?? document.body.appendChild(document.createElement("p"));
    status.textContent = message("actionFailed") || "Could not load Push My Tabs.";
    const feedback = $(".feedback");
    if (feedback) feedback.hidden = false;
    const retry = $("#retry-save") ?? document.body.appendChild(document.createElement("button"));
    retry.textContent = message("tryAgain") || "Try again";
    retry.hidden = false;
    retry.onclick = () => location.reload();
  }
}

async function startApp(popup) {
  const settings = await loadSettings();
  await initializeI18n(settings.locale);
  localizeDocument();
  document.title = message(popup ? "extensionName" : "optionsTitle");
  for (const slot of all("[data-icon]")) slot.append(icon(slot.dataset.icon));
  const feedback = $(".feedback");
  const task = createTaskRunner($("#save-status"), $("#retry-save"));
  let feedbackTimer;
  function run(work, options) {
    clearTimeout(feedbackTimer);
    feedback.hidden = false;
    return task(work, options).then((success) => {
      if (!success) feedback.scrollIntoView({ block: "nearest" });
      if (success) feedbackTimer = setTimeout(() => { feedback.hidden = true; }, 2400);
      return success;
    });
  }

  const os = await platformOS();
  const suggestions = recommendedShortcuts(os);
  const canEditHere = typeof api.commands.update === "function";
  const manifest = api.runtime.getManifest();
  let commands = await api.commands.getAll();
  let context;
  try {
    context = await currentContext();
    // The full options page must not target itself when a real browser tab is available.
    if (!popup && context.activeTab?.url?.startsWith(api.runtime.getURL(""))) {
      const target = context.tabs.filter((tab) => !tab.url?.startsWith(api.runtime.getURL(""))).sort((a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0))[0];
      context = { ...context, activeTab: target };
    }
  } catch (error) {
    console.warn("Could not read current tab:", error);
    context = { window: {}, tabs: [], activeTab: null };
  }
  let { window: browserWindow, activeTab, tabs } = context;
  let detection = await layoutDetection(browserWindow, activeTab, settings);
  let chosenLayout = detection.confidence === "uncertain" ? recommendedAmbiguousLayout(browserWindow, activeTab) : detection.layout;
  chosenLayout ??= settings.layoutMode === "auto" ? "horizontal" : settings.layoutMode;
  let totalTabs = tabs.length;
  try { totalTabs = (await api.windows.getAll({ populate: true })).reduce((sum, win) => sum + (win.tabs?.length ?? 0), 0); } catch { /* Current-window count remains usable. */ }
  if (activeTab?.id) await api.action.setBadgeText({ tabId: activeTab.id, text: "" }).catch(() => {});

  let currentView;
  function requestedView() {
    const hash = location.hash.slice(1);
    if (["recent-shortcuts", "direction-shortcuts"].includes(hash)) return "shortcuts";
    return Object.hasOwn(views, hash) ? hash : popup ? "navigation" : "settings";
  }
  function navigate(view, { focus = true, group } = {}) {
    if (!Object.hasOwn(views, view)) return;
    currentView = view;
    for (const page of all("[data-page]")) page.hidden = page.dataset.page !== view;
    for (const button of all("[data-view]")) {
      if (button.dataset.view === view) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
    $("#view-heading").textContent = message(views[view]);
    history.replaceState(null, "", `#${view}`);
    $(".workspace").scrollTop = 0;
    if (focus) $("#view-heading").focus({ preventScroll: true });
    if (group && document.getElementById(group)) {
      const section = document.getElementById(group);
      section.open = true;
      section.scrollIntoView({ block: "nearest" });
      section.querySelector("input, button")?.focus({ preventScroll: true });
    }
  }
  for (const button of all("[data-view]")) {
    button.setAttribute("aria-label", message(button.dataset.label));
    button.addEventListener("click", () => navigate(button.dataset.view));
  }
  for (const button of all("[data-go]")) button.addEventListener("click", () => navigate(button.dataset.go, { group: button.dataset.group }));
  window.addEventListener("hashchange", () => navigate(requestedView()));

  function keycap(raw) {
    const key = document.createElement("kbd");
    key.textContent = shortcutLabel(raw, os) || message("shortcutUnassigned");
    key.classList.toggle("is-unassigned", !raw);
    key.setAttribute("aria-label", shortcutLabel(raw, os, true) || message("shortcutUnassigned"));
    return key;
  }
  function effectiveLayout() { return settings.layoutMode === "auto" ? detection.layout ?? chosenLayout : settings.layoutMode; }
  function needsConfirmation() { return settings.layoutMode === "auto" && detection.confidence === "uncertain"; }
  function commandLabel(command) {
    if (COMMANDS.includes(command.name)) return message(ACTIONS[selectedAction(settings, effectiveLayout(), command.name)]);
    return recentLabels[command.name] ? message(recentLabels[command.name]) : command.description;
  }
  function actionRow(command) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "action-row";
    row.dataset.command = command.name;
    row.append(icon(COMMANDS.includes(command.name) ? command.name.slice(6) : RECENT_TAB_COMMANDS.includes(command.name) ? "clock" : "chevron"));
    const name = document.createElement("span");
    name.className = "action-name";
    name.textContent = commandLabel(command);
    row.append(name, keycap(command.shortcut));
    const isDirection = COMMANDS.includes(command.name);
    row.disabled = !activeTab || (isDirection && (needsConfirmation() || selectedAction(settings, effectiveLayout(), command.name) === "none")) || (RECENT_TAB_COMMANDS.includes(command.name) && totalTabs < 2);
    row.addEventListener("click", () => run(async () => {
      const result = await api.runtime.sendMessage({ type: "run-command", command: command.name, targetTabId: activeTab?.id });
      if (result?.needsConfirmation) {
        const latest = await currentContext(activeTab);
        browserWindow = latest.window;
        activeTab = latest.activeTab;
        tabs = latest.tabs;
        await redetect();
        navigate("layout");
        return;
      }
      if (!result?.ok) throw new Error(result?.error || "Command not completed");
      if (popup) window.close();
    }, { success: null, failure: "actionFailed" }));
    return row;
  }
  function renderActions() {
    const byName = new Map(commands.map((command) => [command.name, command]));
    $("#mapping-preview").replaceChildren(...COMMANDS.map((name) => byName.get(name)).filter(Boolean).map(actionRow));
    $("#recent-actions").replaceChildren(...RECENT_TAB_COMMANDS.map((name) => byName.get(name)).filter(Boolean).map(actionRow));
    $("#quick-actions").replaceChildren(...[...TAB_CREATION_COMMANDS, ...HISTORY_COMMANDS, ...TAB_ACTION_COMMANDS].map((name) => byName.get(name)).filter(Boolean).map(actionRow));
    const count = COMMANDS.filter((name) => byName.get(name)?.shortcut).length;
    $("#direction-shortcut-status").textContent = `${message("currentMapping")}: ${count}/${COMMANDS.length}`;
    $("#single-tab-help").hidden = totalTabs >= 2;
    const preview = needsConfirmation() ? recommendedAmbiguousLayout(browserWindow, activeTab) : detection.layout;
    const status = layoutStatusText(settings, detection, preview);
    for (const id of ["#detected", "#layout-source"]) {
      $(id).replaceChildren(icon(effectiveLayout() === "vertical" ? "vertical" : "navigation"), document.createTextNode(status));
    }
    $("#confirmation-notice").hidden = !needsConfirmation();
    $("#mapping-context").textContent = preview ? message("mappingPreview", message(preview === "vertical" ? "layoutVertical" : "layoutHorizontal")) : message("layoutNeedsConfirmation");
    $("#estimated-help").hidden = settings.layoutMode !== "auto" || !["confident", "uncertain"].includes(detection.confidence);
  }
  async function redetect() {
    detection = await layoutDetection(browserWindow, activeTab, settings);
    chosenLayout = settings.layoutMode !== "auto" ? settings.layoutMode : detection.confidence === "uncertain" ? recommendedAmbiguousLayout(browserWindow, activeTab) : detection.layout;
    chosenLayout ??= "horizontal";
    renderActions();
    renderLayout();
    renderShortcuts();
  }

  const origin = siteProfileKey(activeTab?.url);
  const path = siteProfileKey(activeTab?.url, "path");
  function renderLayout() {
    for (const input of all('[name="layout-mode"]')) input.checked = input.value === settings.layoutMode;
    for (const button of all("[data-layout]")) button.setAttribute("aria-pressed", String(button.dataset.layout === chosenLayout));
    const hasGeometry = Boolean(detection.key);
    $("#scope-field").hidden = !origin || !hasGeometry;
    $("#site-host").textContent = origin ? $("#profile-scope").value === "path" ? path : origin : "";
    $("#site-heading").textContent = origin && hasGeometry ? message("currentSiteHeading") : message("layoutNeedsConfirmation");
    $("#confirmation-scope").textContent = origin && hasGeometry
      ? message("confirmationSite", new URL(origin).host)
      : hasGeometry ? message("confirmationGeometry") : message("confirmationManual");
    $("#confirmation-auto-help").hidden = !hasGeometry || settings.layoutMode === "auto";
    $("#remember-layout").disabled = !activeTab;
    renderProfiles();
  }
  for (const input of all('[name="layout-mode"]')) input.addEventListener("change", () => {
    const value = input.value;
    run(async () => {
      await api.storage.local.set({ layoutMode: value });
      settings.layoutMode = value;
      await redetect();
    });
  });
  for (const button of all("[data-layout]")) button.addEventListener("click", () => {
    chosenLayout = button.dataset.layout;
    for (const tile of all("[data-layout]")) tile.setAttribute("aria-pressed", String(tile === button));
  });
  $("#profile-scope").addEventListener("change", renderLayout);
  $("#remember-layout").addEventListener("click", () => {
    const layout = chosenLayout;
    const scope = $("#profile-scope").value;
    run(async () => {
      if (origin && detection.key) {
        const next = { ...settings, siteProfiles: { ...settings.siteProfiles } };
        saveSiteLayoutHint(next, activeTab, detection.key, layout, scope);
        await api.storage.local.set({ siteProfiles: next.siteProfiles, layoutMode: "auto" });
        settings.siteProfiles = next.siteProfiles;
        settings.layoutMode = "auto";
      } else if (detection.key) {
        const hints = { ...settings.layoutHints, [detection.key]: layout };
        await api.storage.local.set({ layoutHints: hints, layoutMode: "auto" });
        settings.layoutHints = hints;
        settings.layoutMode = "auto";
      } else {
        await api.storage.local.set({ layoutMode: layout });
        settings.layoutMode = layout;
      }
      await redetect();
    });
  });
  function profileRow(label, key, layout, remove) {
    const row = document.createElement("div");
    row.className = "profile-row";
    const text = document.createElement("p");
    text.textContent = label;
    const detail = document.createElement("small");
    detail.textContent = `${message(layout === "vertical" ? "layoutVertical" : "layoutHorizontal")} · ${message("geometryMeasure", key.split(":"))}`;
    text.append(detail);
    const button = document.createElement("button");
    button.type = "button";
    button.append(icon("close"));
    button.setAttribute("aria-label", `${message("removeProfile")}: ${label} · ${detail.textContent}`);
    button.addEventListener("click", () => run(remove));
    row.append(text, button);
    return row;
  }
  function renderProfiles() {
    const siteRows = [];
    for (const [profile, hints] of Object.entries(settings.siteProfiles).sort(([a], [b]) => a.localeCompare(b))) {
      for (const [key, layout] of Object.entries(hints)) siteRows.push(profileRow(profile, key, layout, async () => {
        const next = { ...settings.siteProfiles, [profile]: { ...settings.siteProfiles[profile] } };
        delete next[profile][key];
        if (!Object.keys(next[profile]).length) delete next[profile];
        await api.storage.local.set({ siteProfiles: next });
        settings.siteProfiles = next;
        await redetect();
      }));
    }
    $("#site-profiles").replaceChildren(...siteRows);
    $("#geometry-profiles").replaceChildren(...Object.entries(settings.layoutHints).map(([key, layout]) => profileRow(message("layoutAuto"), key, layout, async () => {
      const hints = { ...settings.layoutHints };
      delete hints[key];
      await api.storage.local.set({ layoutHints: hints });
      settings.layoutHints = hints;
      await redetect();
    })));
    $("#clear-layout-hints").hidden = !Object.keys(settings.layoutHints).length;
    $("#saved-profiles").hidden = !siteRows.length && !Object.keys(settings.layoutHints).length;
  }
  $("#clear-layout-hints").addEventListener("click", () => run(async () => {
    await api.storage.local.set({ layoutHints: {} });
    settings.layoutHints = {};
    await redetect();
  }));

  function renderShortcuts() {
    const targets = [[$("#shortcuts"), COMMANDS], [$("#recent-commands"), RECENT_TAB_COMMANDS], [$("#optional-commands"), [...HISTORY_COMMANDS, ...TAB_CREATION_COMMANDS, ...TAB_ACTION_COMMANDS]]];
    for (const [container, names] of targets) {
      container.replaceChildren(...names.map((name) => commands.find((command) => command.name === name)).filter(Boolean).map((command) => {
        const row = document.createElement("div");
        row.className = "shortcut-row";
        row.dataset.shortcut = command.name;
        const line = document.createElement("div");
        line.className = "shortcut-line";
        const name = document.createElement("span");
        name.className = "shortcut-name";
        const label = document.createElement("strong");
        label.textContent = commandLabel(command);
        name.append(label);
        if (COMMANDS.includes(command.name) && settings.layoutMode === "auto") {
          const horizontal = message(ACTIONS[selectedAction(settings, "horizontal", command.name)]);
          const vertical = message(ACTIONS[selectedAction(settings, "vertical", command.name)]);
          if (horizontal !== vertical) {
            const effect = document.createElement("small");
            effect.className = "effective-action sr-only";
            effect.textContent = `${message("layoutHorizontal")}: ${horizontal} · ${message("layoutVertical")}: ${vertical}`;
            name.append(effect);
          }
        }
        line.append(name, keycap(command.shortcut));
        row.append(line);
        if (canEditHere) {
          const controls = document.createElement("div");
          controls.className = "shortcut-controls";
          const input = document.createElement("input");
          input.value = command.shortcut || "";
          input.placeholder = message("shortcutUnassigned");
          input.setAttribute("aria-label", `${commandLabel(command)} · ${message("shortcutsViewHeading")}`);
          const error = document.createElement("p");
          error.className = "shortcut-error";
          error.setAttribute("role", "status");
          error.hidden = true;
          function save(value) {
            run(async () => {
              try {
                await updateCommandShortcut(command.name, value);
                commands = await api.commands.getAll();
                renderActions();
                // Preserve the focused input and pointer target while updating native results.
                for (const current of commands) {
                  const existing = document.querySelector(`[data-shortcut="${current.name}"]`);
                  existing?.querySelector("kbd")?.replaceWith(keycap(current.shortcut));
                  const field = existing?.querySelector("input");
                  if (field && (field === input || document.activeElement !== field)) field.value = current.shortcut || "";
                }
                input.removeAttribute("aria-invalid");
                error.hidden = true;
              } catch (failure) {
                input.setAttribute("aria-invalid", "true");
                error.textContent = message("shortcutSaveFailed", failure.message);
                error.hidden = false;
                throw failure;
              }
            }, { success: "shortcutSaved", failure: "shortcutSaveFailed" });
          }
          input.addEventListener("change", () => save(input.value));
          controls.append(input);
          if (suggestions[command.name]) {
            const use = document.createElement("button");
            use.className = "text-button";
            use.type = "button";
            use.textContent = `${message("useShortcutSuggestion")} ${shortcutLabel(suggestions[command.name], os)}`;
            use.addEventListener("click", () => save(suggestions[command.name]));
            controls.append(use);
          }
          row.append(controls, error);
        }
        return row;
      }));
    }
  }
  $("#shortcut-settings").hidden = canEditHere;
  $("#shortcut-help").textContent = message(canEditHere ? "shortcutHelpFirefox" : "shortcutHelpChrome");
  $("#shortcut-settings").addEventListener("click", () => run(async () => {
    await api.tabs.create({ url: "chrome://extensions/shortcuts" });
    if (popup) window.close();
  }, { success: null, failure: "actionFailed" }));
  $("#platform-caption").textContent = platformName(os) ? `${platformName(os)} · ${message("layoutAuto")}` : message("platformUnknown");
  $("#key-legend").textContent = os === "mac" ? "⌘ Command · ⌥ Option · ⇧ Shift · ⌃ Control" : "Ctrl · Alt · Shift · ← ↑ ↓ →";
  window.addEventListener("focus", async () => {
    if ($(":focus")?.matches("[data-shortcut] input")) return;
    try {
      commands = await api.commands.getAll();
      renderActions();
      renderShortcuts();
    } catch (error) { console.warn("Could not refresh shortcuts:", error); }
  });

  $("#preset").value = settings.presetId;
  function renderCustom() {
    $("#custom-section").hidden = settings.presetId !== "custom";
    $("#preset").value = settings.presetId;
  }
  function saveSetting(control, key, refresh = false) {
    control.addEventListener("change", () => {
      const value = control.type === "checkbox" ? control.checked : control.value;
      run(async () => {
        await api.storage.local.set({ [key]: value });
        settings[key] = value;
        renderCustom();
        if (refresh) location.reload();
        else { renderActions(); renderShortcuts(); }
      });
    });
  }
  saveSetting($("#preset"), "presetId");
  for (const layout of ["horizontal", "vertical"]) {
    const mapping = $(`[data-mapping="${layout}"]`);
    for (const command of COMMANDS) {
      const label = document.createElement("label");
      label.append(icon(command.slice(6)));
      const select = document.createElement("select");
      select.setAttribute("aria-label", `${message(layout === "horizontal" ? "layoutHorizontal" : "layoutVertical")} · ${message({ "arrow-left": "directionLeft", "arrow-right": "directionRight", "arrow-up": "directionUp", "arrow-down": "directionDown" }[command])}`);
      for (const [value, key] of Object.entries(ACTIONS)) select.add(new Option(message(key), value));
      select.value = settings.customPreset[layout][command];
      select.addEventListener("change", () => {
        const value = select.value;
        run(async () => {
          const customPreset = { ...settings.customPreset, [layout]: { ...settings.customPreset[layout], [command]: value } };
          await api.storage.local.set({ customPreset, presetId: "custom" });
          settings.customPreset = customPreset;
          settings.presetId = "custom";
          renderCustom(); renderActions(); renderShortcuts();
        });
      });
      label.append(select);
      mapping.append(label);
    }
  }
  renderCustom();

  for (const [value, name] of Object.entries(languages)) $("#language").add(new Option(value === "browser" ? message("languageBrowser").replace(/^🌐\s*/, "") : name, value));
  $("#language").value = settings.locale;
  $("#wrap").checked = settings.wrapSwitching;
  $("#close-direction").value = settings.closeDirection;
  saveSetting($("#language"), "locale", true);
  saveSetting($("#wrap"), "wrapSwitching");
  saveSetting($("#close-direction"), "closeDirection");

  let privateAccess = null;
  try { if (api.extension?.isAllowedIncognitoAccess) privateAccess = await api.extension.isAllowedIncognitoAccess(); } catch { /* Show unknown rather than claiming permission. */ }
  $("#private-status").textContent = message(privateAccess === true ? "privateAllowed" : privateAccess === false ? "privateDenied" : "privateUnknown");
  $("#incognito-warning").hidden = !activeTab?.incognito || await isIncognitoAllowed(activeTab);
  $("#private-help").hidden = !canEditHere;
  if (canEditHere) $("#incognito-warning p").textContent = message("privateFirefoxHelp");
  for (const button of all("[data-open-permissions]")) {
    // Firefox/Zen reject privileged about: URLs opened through tabs.create.
    button.hidden = canEditHere;
    if (!canEditHere) button.addEventListener("click", () => run(async () => {
      await api.tabs.create({ url: `chrome://extensions/?id=${api.runtime.id}` });
      if (popup) window.close();
    }, { success: null, failure: "actionFailed" }));
  }
  $("#app-version").textContent = `Push My Tabs ${manifest.version}`;
  if (manifest.homepage_url) $("#project-link").href = manifest.homepage_url;
  else $("#project-link").hidden = true;

  renderActions(); renderLayout(); renderShortcuts();
  const initialGroup = location.hash === "#recent-shortcuts" ? "recent-shortcuts" : null;
  navigate(requestedView(), { focus: false, group: initialGroup });
}
