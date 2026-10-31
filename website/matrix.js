(() => {
  const field = document.querySelector("#matrix-field");
  const toggle = document.querySelector(".motion-toggle");
  if (!field || !toggle) return;

  const glyphs = "01←→01↑↓1010";
  for (let column = 0; column < 32; column += 1) {
    const stream = document.createElement("span");
    stream.className = "matrix-stream";
    stream.textContent = Array.from({ length: 18 + column % 13 }, (_, row) =>
      glyphs[(row * 7 + column * 3) % glyphs.length]).join("\n");
    stream.dataset.head = glyphs[column % glyphs.length];
    stream.style.setProperty("--x", `${column * 3.2}%`);
    stream.style.setProperty("--duration", `${14 + column % 12}s`);
    stream.style.setProperty("--delay", `${-(column * 2.7 % 24)}s`);
    field.append(stream);
  }

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = false;
  function sync() {
    document.documentElement.dataset.matrixPaused = String(paused || reducedMotion.matches || document.hidden);
    toggle.hidden = reducedMotion.matches;
    toggle.setAttribute("aria-pressed", String(paused));
  }
  toggle.addEventListener("click", () => {
    paused = !paused;
    sync();
  });
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  sync();
})();
