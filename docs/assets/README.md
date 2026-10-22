# README illustrations

- `push-my-tabs-banner.svg`: original SVG artwork created for this project's README refresh. Text and shapes are embedded; no external images, fonts, or scripts are loaded.
- `tabs-demo.gif` and `tabs-demo-poster.png`: programmatically drawn illustrations of the adaptive Shortcut Preset in `src/layout.js`. They show horizontal switching, vertical switching, and moving the active horizontal tab. They are not recordings of the extension, browser UI screenshots, or evidence of an integration test. Direction labels identify extension commands, not fixed keyboard bindings. The shared artwork uses English labels; each README provides localized explanations and the direction table.
- `molebyte-pixel.gif`: existing project mascot, reused unchanged from this repository.

The banner, demo, and poster originated in the maintainer's reviewed README draft and were redrawn for mobile readability. They are included under the repository's existing [MIT License](../../LICENSE). They contain no third-party browser logos or captured page content. The mascot remains the existing project asset; no new ownership claim is made here. The static poster is linked alongside the animation for readers who prefer a still image.

## Rebuilding the demo

`render-demo.py` draws the illustration from text and shapes; it does not edit browser recordings. With Python 3 and Pillow available, run `python3 docs/assets/render-demo.py --font <bold-font.ttf>`. Supply a local bold TrueType font (the current artwork uses Arial Bold); the font file is not distributed. The script writes the GIF and static poster beside itself.

Check the actual GitHub README at 320 px and 390 px viewport widths as well as desktop width. At 320 px, GitHub leaves about 256 px for the illustration: labels must therefore be at least 40 px on the 600 px source canvas (about 17 px when displayed). Avoid small decorative captions in the banner. Keep detailed explanations in README text so they reflow and remain accessible. Recheck the animation's switching and movement against `src/layout.js`, and keep the poster and provenance in sync.
