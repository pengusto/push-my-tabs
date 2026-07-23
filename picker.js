let nextPickerId = 0;

function optionContent(option) {
  const fragment = document.createDocumentFragment();
  if (option.dataset.iconSrc) {
    const image = document.createElement("img");
    image.src = option.dataset.iconSrc;
    image.alt = "";
    fragment.append(image);
  } else if (option.dataset.icon) {
    const icon = document.createElement("span");
    icon.textContent = option.dataset.icon;
    icon.setAttribute("aria-hidden", "true");
    fragment.append(icon);
  }
  fragment.append(document.createTextNode(option.textContent));
  return fragment;
}

export function enhanceSelect(select) {
  const id = `picker-${nextPickerId++}`;
  const picker = document.createElement("div");
  picker.className = "picker";
  picker.classList.toggle("picker--language", select.classList.contains("language-select"));

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "picker-trigger";
  trigger.setAttribute("popovertarget", id);
  trigger.setAttribute("aria-controls", id);
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-haspopup", "listbox");
  const label = select.getAttribute("aria-label") || select.previousElementSibling?.textContent || "";
  const current = document.createElement("span");
  const arrow = document.createElement("span");
  arrow.textContent = "▾";
  arrow.setAttribute("aria-hidden", "true");
  trigger.append(current, arrow);

  const menu = document.createElement("div");
  menu.id = id;
  menu.className = "picker-menu";
  menu.popover = "auto";
  menu.setAttribute("role", "listbox");

  const buttons = [...select.options].map((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.value = option.value;
    button.setAttribute("role", "option");
    button.append(optionContent(option));
    button.addEventListener("click", () => {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      menu.hidePopover();
      trigger.focus();
    });
    menu.append(button);
    return button;
  });

  function sync() {
    const option = select.selectedOptions[0];
    current.replaceChildren(optionContent(option));
    trigger.setAttribute("aria-label", `${label}: ${option.textContent}`);
    for (const button of buttons) button.setAttribute("aria-selected", String(button.dataset.value === option.value));
  }

  function positionMenu() {
    const { bottom, left, top, width } = trigger.getBoundingClientRect();
    const menuHeight = Math.min(select.options.length * 40 + 12, 420);
    const menuWidth = Math.min(width, innerWidth - 32);
    menu.style.left = `${Math.max(16, Math.min(left, innerWidth - menuWidth - 16))}px`;
    menu.style.top = `${bottom + menuHeight + 16 <= innerHeight ? bottom + 8 : Math.max(16, top - menuHeight - 8)}px`;
    menu.style.width = `${menuWidth}px`;
  }

  trigger.addEventListener("click", positionMenu);
  trigger.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    positionMenu();
    if (!menu.matches(":popover-open")) menu.showPopover();
    buttons[event.key === "ArrowUp" ? buttons.length - 1 : 0].focus();
  });
  menu.addEventListener("keydown", (event) => {
    const index = buttons.indexOf(document.activeElement);
    const target = event.key === "Home" ? 0
      : event.key === "End" ? buttons.length - 1
        : event.key === "ArrowDown" ? (index + 1) % buttons.length
          : event.key === "ArrowUp" ? (index - 1 + buttons.length) % buttons.length
            : -1;
    if (target < 0) return;
    event.preventDefault();
    buttons[target].focus();
  });
  menu.addEventListener("toggle", ({ newState }) => {
    trigger.setAttribute("aria-expanded", String(newState === "open"));
  });
  select.addEventListener("change", sync);
  select.hidden = true;
  select.after(picker);
  picker.append(trigger, menu);
  sync();
}
