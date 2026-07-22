import { api } from "./api.js";

export const LOCALES = ["en", "de", "es", "fr", "pt_BR", "it", "pl", "tr", "ja", "zh_CN", "ar", "ru", "uk", "ku", "fa"];

let catalog = {};
let activeLocale = "en";

export function resolveLocale(language) {
  const normalized = language.replace("-", "_");
  const exact = LOCALES.find((locale) => locale.toLowerCase() === normalized.toLowerCase());
  if (exact) return exact;

  const base = normalized.split("_")[0].toLowerCase();
  if (base === "pt") return "pt_BR";
  if (base === "zh") return "zh_CN";
  return LOCALES.find((locale) => locale.toLowerCase() === base) ?? "en";
}

export async function initializeI18n(locale = "browser") {
  activeLocale = locale === "browser" ? resolveLocale(api.i18n.getUILanguage()) : locale;
  if (!LOCALES.includes(activeLocale)) activeLocale = "en";

  const response = await fetch(api.runtime.getURL(`_locales/${activeLocale}/messages.json`));
  catalog = await response.json();
}

export function message(name, substitutions = []) {
  const entry = catalog[name];
  if (!entry) return "";

  const values = Array.isArray(substitutions) ? substitutions : [substitutions];
  return entry.message.replace(/\$([A-Z0-9_]+)\$/gi, (token, placeholderName) => {
    const content = entry.placeholders?.[placeholderName.toLowerCase()]?.content;
    const index = /^\$(\d+)$/.exec(content)?.[1];
    return index ? String(values[Number(index) - 1] ?? "") : token;
  });
}

export function localizeDocument(root = document) {
  root.documentElement.lang = activeLocale.replace("_", "-");
  root.documentElement.dir = ["ar", "fa"].includes(activeLocale) ? "rtl" : "ltr";

  for (const element of root.querySelectorAll("[data-i18n]")) {
    element.textContent = message(element.dataset.i18n);
  }

  for (const element of root.querySelectorAll("[data-i18n-aria-label]")) {
    element.setAttribute("aria-label", message(element.dataset.i18nAriaLabel));
  }
}
