// Each illustrated browser is independent. Never intercept real browser shortcuts.
for (const panel of document.querySelectorAll(".demo-panel")) {
  const list = panel.querySelector(".tab-list");
  const status = panel.querySelector(".demo-status");
  const commands = panel.querySelector(".command-row");
  const vertical = panel.dataset.layout === "vertical";
  const items = () => [...list.querySelectorAll(".demo-tab")];
  const activeIndex = () => items().findIndex((tab) => tab.classList.contains("is-active"));

  function update(message) {
    const tabs = items();
    const index = activeIndex();
    for (const tab of tabs) {
      tab.setAttribute("aria-pressed", String(tab.classList.contains("is-active")));
    }
    // Switching wraps, like the default preset. Moving stops at the edge.
    commands.querySelector('[data-command="backward"]').disabled = index === 0;
    commands.querySelector('[data-command="forward"]').disabled = index === tabs.length - 1;
    status.textContent = message;
  }

  function setActive(tab) {
    for (const candidate of items()) candidate.classList.toggle("is-active", candidate === tab);
    update(`${tab.textContent.trim()} is active.`);
  }

  for (const tab of items()) tab.addEventListener("click", () => setActive(tab));
  commands.hidden = false;
  update(`Research is active. Draft is ${vertical ? "below" : "to the right"}.`);
  commands.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-command]");
    if (!button || button.disabled) return;
    const tabs = items();
    const index = activeIndex();
    const command = button.dataset.command;
    const switching = command === "previous" || command === "next";
    const offset = command === "previous" || command === "backward" ? -1 : 1;
    const target = switching
      ? (index + offset + tabs.length) % tabs.length
      : Math.max(0, Math.min(index + offset, tabs.length - 1));
    if (switching) {
      setActive(tabs[target]);
    } else {
      const active = tabs[index];
      tabs.splice(index, 1);
      tabs.splice(target, 0, active);
      list.append(...tabs);
      update(`${active.textContent.trim()} moved ${vertical ? (offset < 0 ? "up" : "down") : (offset < 0 ? "left" : "right")}.`);
    }
  });
}
