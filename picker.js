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
  trigger.setAttribute("aria-label", select.getAttribute("aria-label") || select.previousElementSibling?.textContent || "");
  const current = document.createElement("span");
  const arrow = document.createElement("span");
  arrow.textContent = "▾";
  arrow.setAttribute("aria-hidden", "true");
  trigger.append(current, arrow);

  const menu = document.createElement("div");
  menu.id = id;
  menu.className = "picker-menu";
  menu.popover = "auto";

  const buttons = [...select.options].map((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.value = option.value;
    button.append(optionContent(option));
    button.addEventListener("click", () => {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      menu.hidePopover();
    });
    menu.append(button);
    return button;
  });

  function sync() {
    const option = select.selectedOptions[0];
    current.replaceChildren(optionContent(option));
    for (const button of buttons) button.toggleAttribute("aria-current", button.dataset.value === option.value);
  }

  trigger.addEventListener("click", () => {
    const { bottom, left, top, width } = trigger.getBoundingClientRect();
    const menuHeight = Math.min(select.options.length * 40 + 12, 420);
    menu.style.left = `${Math.max(16, Math.min(left, innerWidth - width - 16))}px`;
    menu.style.top = `${bottom + menuHeight + 16 <= innerHeight ? bottom + 8 : Math.max(16, top - menuHeight - 8)}px`;
    menu.style.width = `${width}px`;
  });
  select.addEventListener("change", sync);
  select.hidden = true;
  select.after(picker);
  picker.append(trigger, menu);
  sync();
}
