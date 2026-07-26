const signalField = document.querySelector("#signal-field");
const glyphs = ["←10→01↑10↓", "↕001↔110", "TAB0101", "MOVE1010", "←←01→→", "↑1↓0↑1↓"];
for (let index = 0; index < 18; index += 1) {
  const stream = document.createElement("span");
  stream.textContent = glyphs[index % glyphs.length];
  stream.style.left = `${3 + index * 5.6}%`;
  stream.style.setProperty("--duration", `${13 + (index % 5) * 2}s`);
  stream.style.setProperty("--delay", `${-index * 1.7}s`);
  signalField.append(stream);
}

const demo = document.querySelector("#browser-demo");
const status = document.querySelector("#demo-status");
const tabList = document.querySelector("#tab-list");
const modeButtons = [...document.querySelectorAll("[data-mode]")];

function tabs() {
  return [...tabList.querySelectorAll(".demo-tab")];
}

function setActive(tab) {
  for (const candidate of tabs()) candidate.classList.toggle("is-active", candidate === tab);
}

function activeIndex() {
  return tabs().findIndex((tab) => tab.classList.contains("is-active"));
}

for (const tab of tabs()) tab.addEventListener("click", () => setActive(tab));

for (const button of modeButtons) {
  button.addEventListener("click", () => {
    const vertical = button.dataset.mode === "vertical";
    demo.classList.toggle("is-vertical", vertical);
    status.textContent = vertical ? "Vertical layout" : "Horizontal layout";
    for (const candidate of modeButtons) {
      const selected = candidate === button;
      candidate.classList.toggle("is-active", selected);
      candidate.setAttribute("aria-pressed", String(selected));
    }
  });
}

document.querySelector(".command-row").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-command]");
  if (!button) return;
  const items = tabs();
  const index = activeIndex();
  const backward = button.dataset.command === "previous" || button.dataset.command === "backward";
  const targetIndex = (index + (backward ? -1 : 1) + items.length) % items.length;

  if (button.dataset.command === "previous" || button.dataset.command === "next") {
    setActive(items[targetIndex]);
    status.textContent = `Active tab: ${items[targetIndex].textContent.trim().replace(/^\d+\s*/, "")}`;
    return;
  }

  const active = items[index];
  items.splice(index, 1);
  items.splice(targetIndex, 0, active);
  tabList.append(...items);
  status.textContent = backward ? "Tab moved backward" : "Tab moved forward";
});
