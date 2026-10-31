// Restore before the stylesheet loads, so a saved light theme doesn't flash dark.
(() => {
  const root = document.documentElement;
  const storageKey = "push-my-tabs-theme";
  let theme = "dark";
  try {
    if (localStorage.getItem(storageKey) === "light") theme = "light";
  } catch { /* Storage can be unavailable; the theme still works for this visit. */ }

  function applyTheme(value) {
    root.dataset.theme = value;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = value === "light" ? "#faf9fd" : "#08090d";
  }
  applyTheme(theme);

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;
    toggle.hidden = false;
    toggle.setAttribute("aria-pressed", String(theme === "light"));
    toggle.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      applyTheme(theme);
      toggle.setAttribute("aria-pressed", String(theme === "light"));
      try { localStorage.setItem(storageKey, theme); }
      catch { /* Keep the chosen theme in memory when persistence is blocked. */ }
    });
  });
})();
