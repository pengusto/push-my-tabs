import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { ACTIONS } from "./layout.js";

const localeNames = (await readdir("_locales")).sort();
assert.deepEqual(localeNames, ["ar", "de", "en", "es", "fa", "fr", "it", "ja", "ku", "pl", "pt_BR", "ru", "tr", "uk", "zh_CN"]);

const locales = Object.fromEntries(await Promise.all(localeNames.map(async (locale) => [
  locale,
  JSON.parse(await readFile(`_locales/${locale}/messages.json`, "utf8"))
])));
const fallbackKeys = Object.keys(locales.en).sort();

for (const [locale, messages] of Object.entries(locales)) {
  assert.deepEqual(Object.keys(messages).sort(), fallbackKeys, `${locale} must contain the fallback key set`);
  for (const [name, value] of Object.entries(messages)) {
    assert.equal(typeof value.message, "string", `${locale}.${name} must have a message`);
    assert.ok(value.message.trim(), `${locale}.${name} must not be empty`);
    assert.deepEqual(
      Object.keys(value.placeholders ?? {}).sort(),
      Object.keys(locales.en[name].placeholders ?? {}).sort(),
      `${locale}.${name} must use the fallback placeholders`
    );
  }
}

const referencedMessages = new Set(Object.values(ACTIONS));
for (const messageName of Object.values(ACTIONS)) {
  assert.ok(locales.en[messageName], `layout action references missing message ${messageName}`);
}

for (const file of ["manifest.json", "manifest.firefox.json", "popup.html", "options.html"]) {
  const content = await readFile(file, "utf8");
  const references = [...content.matchAll(/(?:__MSG_|data-i18n(?:-aria-label)?=")([A-Za-z][A-Za-z0-9]*)/g)];
  for (const [, name] of references) {
    assert.ok(locales.en[name], `${file} references missing message ${name}`);
    referencedMessages.add(name);
  }
}

for (const file of ["popup.js", "options.js"]) {
  const content = await readFile(file, "utf8");
  for (const [, name] of content.matchAll(/message\("([A-Za-z][A-Za-z0-9]*)"/g)) {
    assert.ok(locales.en[name], `${file} references missing message ${name}`);
    referencedMessages.add(name);
  }
}
assert.deepEqual([...referencedMessages].sort(), fallbackKeys, "fallback must not contain unused messages");

globalThis.chrome = {
  i18n: {
    getMessage: () => "",
    getUILanguage: () => "de-DE"
  },
  runtime: { getURL: (path) => path }
};
globalThis.fetch = async (path) => ({ json: async () => JSON.parse(await readFile(path, "utf8")) });
const { initializeI18n, localizeDocument, LOCALES, message, resolveLocale } = await import("./i18n.js");
assert.deepEqual([...LOCALES].sort(), localeNames);
assert.equal(resolveLocale("pt-PT"), "pt_BR");
assert.equal(resolveLocale("zh-Hans"), "zh_CN");
assert.equal(resolveLocale("en-US"), "en");
assert.equal(resolveLocale("nl-NL"), "en");
await initializeI18n("browser");
assert.equal(message("layoutModeLabel"), "Layout-Modus");
assert.equal(message("layoutDetected", "Vertikal"), "Vertikal erkannt");
await initializeI18n("en");
assert.equal(message("layoutModeLabel"), "Layout mode");
assert.equal(message("missing"), "");

const textElement = { dataset: { i18n: "layoutModeLabel" }, textContent: "" };
const ariaElement = {
  dataset: { i18nAriaLabel: "currentMappingAriaLabel" },
  setAttribute: (name, value) => { ariaElement[name] = value; }
};
const root = {
  documentElement: { lang: "" },
  querySelectorAll: (selector) => selector === "[data-i18n]" ? [textElement] : [ariaElement]
};
localizeDocument(root);
assert.equal(root.documentElement.lang, "en");
assert.equal(textElement.textContent, "Layout mode");
assert.equal(ariaElement["aria-label"], "Current key mapping");

await initializeI18n("ar");
localizeDocument(root);
assert.equal(root.documentElement.lang, "ar");
assert.equal(root.documentElement.dir, "rtl");
assert.equal(textElement.textContent, "وضع التخطيط");

await initializeI18n("fa");
localizeDocument(root);
assert.equal(root.documentElement.lang, "fa");
assert.equal(root.documentElement.dir, "rtl");
assert.equal(textElement.textContent, "حالت چیدمان");

console.log("i18n checks passed");
