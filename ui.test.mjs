import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [popup, popupScript, options, optionsScript, picker, styles] = await Promise.all([
  readFile("popup.html", "utf8"),
  readFile("popup.js", "utf8"),
  readFile("options.html", "utf8"),
  readFile("options.js", "utf8"),
  readFile("picker.js", "utf8"),
  readFile("styles.css", "utf8")
]);

for (const name of ["layoutModeLabel", "presetLabel", "currentMappingAriaLabel"]) {
  assert.match(popup, new RegExp(name), `popup must expose ${name}`);
}
assert.match(popup, /id="layout-confirmation"/);
assert.match(options, /id="close-direction"/);
assert.match(popup, /data-layout="recommended"/);
assert.match(popup, /data-layout="vertical"/);
assert.match(popup, /data-layout="horizontal"/);
assert.match(popup, /id="remember-site"/);
assert.match(popup, /id="remember-path"/);
assert.match(popup, /class="icon-select"/);
assert.match(popup, /class="remove-profile"/);
assert.match(popupScript, /delete settings\.siteProfiles\[profile\]\[detection\.key\]/);
assert.match(popupScript, /message\("geometryMeasure", detection\.key\.split\(":"\)\)/, "saved browser gaps must be explained in the popup");
assert.doesNotMatch(popupScript, /siteProfiles: settings\.siteProfiles \}\);\n\s+location\.reload/, "saving or removing a site must not reload and resize the popup");
assert.match(popupScript, /const layoutIcon = activeLayout === "vertical" \? "↕" : "↔"/);
assert.match(popupScript, /icon\.className = "layout-status-icon"/);
assert.doesNotMatch(popupScript, /settings\.layoutMode === "auto" && originProfile/, "site buttons must also work with a forced global mode");
assert.match(options, /id="shortcut-settings"/);
assert.match(options, /id="site-profiles"/);
assert.match(options, /id="clear-layout-hints"/);
assert.doesNotMatch(optionsScript, /Object\.keys\(hints\)\.length/, "internal geometry count must not be shown as an unexplained 1×");
assert.match(optionsScript, /message\("geometryMeasure", key\.split\(":"\)\)/, "saved browser gaps must be explained in settings");
assert.match(optionsScript, /layout === "vertical" \? "↕" : "↔"/);
assert.match(options, /data-i18n="changeShortcuts"/);
assert.match(optionsScript, /updateCommandShortcut\(command\.name, input\.value\)/);
assert.match(optionsScript, /TAB_CREATION_COMMANDS/);
assert.match(optionsScript, /recommendedShortcuts/);
assert.match(optionsScript, /⌘⌥↓/);
assert.match(styles, /\.shortcut-name small/);
assert.match(optionsScript, /shortcutSaveFailed", error\.message/);
assert.match(optionsScript, /api\.commands\.openShortcutSettings/);
assert.match(styles, /\.is-unassigned\s*{/);
assert.match(styles, /\.popup\s*{[^}]*width:\s*360px/s);
assert.match(styles, /:focus-visible\s*{/);
assert.match(styles, /\[hidden\]\s*\{\s*display:\s*none\s*!important/);
assert.match(styles, /:not\(\.site-learning\)/, "site buttons stay visible while confirming an uncertain layout");
assert.match(styles, /\.layout-status-icon\s*\{[^}]*place-items:\s*center/s);
assert.match(styles, /\.layout-status-icon\s*\{[^}]*font-size:\s*16px/s);
assert.doesNotMatch(styles, /\.layout-status::before/, "layout status must not render a redundant dot before the arrow");
assert.match(picker, /aria-haspopup/);
assert.match(picker, /aria-selected/);
for (const key of ["ArrowDown", "ArrowUp", "Home", "End"]) assert.match(picker, new RegExp(key));

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((value) => parseInt(value, 16) / 255)
    .map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
}

function contrast(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + .05) / (darker + .05);
}

assert.ok(contrast("#f7f7fb", "#0d0e12") >= 4.5, "primary text contrast");
assert.ok(contrast("#b3b4c2", "#0d0e12") >= 4.5, "muted text contrast");
assert.ok(contrast("#f7f7fb", "#22232d") >= 4.5, "control text contrast");
assert.ok(contrast("#ddd9ff", "#302b59") >= 4.5, "status text contrast");

console.log("UI accessibility checks passed");
