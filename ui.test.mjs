import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [popup, options, picker, styles] = await Promise.all([
  readFile("popup.html", "utf8"),
  readFile("options.html", "utf8"),
  readFile("picker.js", "utf8"),
  readFile("styles.css", "utf8")
]);

for (const name of ["layoutModeLabel", "presetLabel", "currentMappingAriaLabel"]) {
  assert.match(popup, new RegExp(name), `popup must expose ${name}`);
}
assert.match(options, /id="shortcut-settings"/);
assert.match(options, /data-i18n="changeShortcuts"/);
assert.match(styles, /\.is-unassigned\s*{/);
assert.match(styles, /\.popup\s*{[^}]*width:\s*360px/s);
assert.match(styles, /:focus-visible\s*{/);
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
