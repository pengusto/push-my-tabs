// Consistent local SVG geometry; no HTML parsing or remote assets.
const paths = {
  navigation: [["path", {"d": "m8 5-6 7 6 7M2 12h20m-6-7 6 7-6 7"}]],
  clock: [["circle", {"cx": "12", "cy": "12", "r": "9"}], ["path", {"d": "M12 6v6l4 2"}]],
  layout: [["rect", {"x": "3", "y": "4", "width": "18", "height": "16", "rx": "2"}], ["path", {"d": "M10 4v16"}]],
  keyboard: [["rect", {"x": "2", "y": "5", "width": "20", "height": "14", "rx": "3"}], ["path", {"d": "M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1m-10 3h8"}]],
  settings: [["path", {"d": "m9 3-1 3-3 1-2 3 2 2-1 3 2 3h3l2 3 4-1 1-3 3-1 2-3-2-2 1-3-2-3h-3l-2-3Z"}], ["circle", {"cx": "12", "cy": "12", "r": "3"}]],
  left: [["path", {"d": "M20 12H4m7-7-7 7 7 7"}]],
  right: [["path", {"d": "M4 12h16m-7-7 7 7-7 7"}]],
  up: [["path", {"d": "M12 20V4m-7 7 7-7 7 7"}]],
  down: [["path", {"d": "M12 4v16m-7-7 7 7 7-7"}]],
  edit: [["path", {"d": "m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-4L4 15Z"}]],
  chevron: [["path", {"d": "m9 5 7 7-7 7"}]],
  external: [["path", {"d": "M14 3h7v7M21 3 10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"}]],
  close: [["path", {"d": "m6 6 12 12M18 6 6 18"}]],
  info: [["circle", {"cx": "12", "cy": "12", "r": "9"}], ["path", {"d": "M12 11v6m0-11v1"}]],
  horizontal: [["rect", {"x": "2", "y": "3", "width": "20", "height": "18", "rx": "2"}], ["path", {"d": "M2 9h20M5 6h3m3 0h3m3 0h2"}]],
  vertical: [["rect", {"x": "2", "y": "3", "width": "20", "height": "18", "rx": "2"}], ["path", {"d": "M8 3v18M4 7h2m-2 5h2m-2 5h2"}]],
};
export function icon(name) {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  for (const [key, value] of Object.entries({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" })) svg.setAttribute(key, value);
  for (const [tag, attributes] of paths[name] ?? paths.info) {
    const child = document.createElementNS(namespace, tag);
    for (const [key, value] of Object.entries(attributes)) child.setAttribute(key, value);
    svg.append(child);
  }
  return svg;
}
