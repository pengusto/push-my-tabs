# README illustrations

- `push-my-tabs-banner.svg`: original SVG artwork created for this project's README refresh. Text and shapes are embedded; no external images, fonts, or scripts are loaded.
- `tabs-demo.gif` and `tabs-demo-poster.png`: programmatically drawn illustrations of the adaptive Shortcut Preset in `src/layout.js`. They show horizontal switching, vertical switching, and moving the active horizontal tab. They are not recordings of the extension, browser UI screenshots, or evidence of an integration test. Direction labels identify extension commands, not fixed keyboard bindings. The shared artwork uses English labels; each README provides localized explanations and the direction table.
- `molebyte-pixel.gif`: existing project mascot, reused unchanged from this repository.

The banner, demo, and poster originated in the maintainer's reviewed README draft and were redrawn for mobile readability. They are included under the repository's existing [MIT License](../../LICENSE). They contain no third-party browser logos or captured page content. The mascot remains the existing project asset; no new ownership claim is made here. The static poster is linked alongside the animation for readers who prefer a still image.

## Rebuilding the demo

`render-demo.py` draws the illustration from text and shapes; it does not edit browser recordings. With Python 3 and Pillow available, run `python3 docs/assets/render-demo.py --font <bold-font.ttf>`. Supply a local bold TrueType font (the current artwork uses Arial Bold); the font file is not distributed. The script writes the GIF and static poster beside itself.

Check the actual GitHub README at 320 px and 390 px viewport widths as well as desktop width. At 320 px, GitHub leaves about 256 px for the illustration: labels must therefore be at least 40 px on the 600 px source canvas (about 17 px when displayed). Avoid small decorative captions in the banner. Keep detailed explanations in README text so they reflow and remain accessible. Recheck the animation's switching and movement against `src/layout.js`, and keep the poster and provenance in sync.

Embed the banner with `width="100%"` in every README so intrinsic image dimensions do not leave unused space on desktop. Keep the height automatic to preserve its proportions.

## Penguin banner

`push-my-tabs-penguin.png` is an AI-generated illustration created with the built-in Imagegen tool on 2026-10-23, using the maintainer-supplied purple profile banner as the visual reference. It depicts the same penguin sliding a stylized tab to the right in a plum-and-lavender island workshop. The cards are abstract illustration, not product screenshots; no browser logos or real page content were used. Existing assets and license terms remain unchanged; this note is provenance, not an independent rights clearance.

The maintainer approved this banner after reviewing the local draft. It was the first published penguin banner and remains available as an alternative. The previous SVG is retained as an original asset. The local draft was checked at 390 px content width and desktop width; local HTML previews are only approximations of GitHub rendering.

## Penguin asset family (2026-10-23)

- `penguin/mascot.png`: transparent full-body penguin holding a tab tile. Generated with built-in Imagegen using the approved penguin banner as the actual identity reference. Replaces the displayed Molebyte in the READMEs; the original remains untouched.
- `penguin/01-horizontal.png`, `02-vertical.png`, `03-move.png`: generated explanatory scenes for the adaptive preset. Labels identify extension commands, not hard-coded shortcut assignments. The scenes depict selecting tab 3 in a horizontal row, selecting tab 3 in a vertical stack, and moving active tab 2 to the end (order 1,3,2). These are illustrations, not UI recordings or new integration-test evidence.
- `penguin/tabs-demo.gif`: a three-scene explanatory slideshow, three seconds per scene. It does not show continuous in-app motion. `penguin/tabs-demo-poster.png` is its first scene. FFmpeg encodes the generated scenes at 600 × 600; no generated screenshot substitutes are used. Original demo files and generator remain available.
- `../../store-assets/penguin/promo/`: two new Imagegen illustrations and exports at 440 × 280 and 1400 × 560 (PNG and JPEG). Generated sources are retained; the existing promo files are untouched. No store upload has been performed.
- `../../store-assets/penguin/marketing/`: five 1280 × 800 product cards. The character is generated; the UI comes from the existing `store-assets/screenshots/*.png`, cropped and scaled without changing labels, controls, or values. These inherited screenshots have not been recaptured against a live installed extension in this task. Their existing icon is intentionally preserved.

All new painted assets use the same approved character, plum background and lavender accents. No new browser logos or third-party artwork were introduced. Existing license and rights limits remain unchanged. UI icons, favicons, and original screenshots are retained to avoid silently changing the extension's functional visual identity.

### Reproduction and acceptance

Product cards are authored in `store-assets/penguin/marketing/cards.json` and `render-cards.mjs`; run `node store-assets/penguin/marketing/render-cards.mjs` to rebuild their HTML. Capture the 1280 × 800 card area: full-page screenshots may include viewport padding, so verify exported pixel dimensions and content bounds instead of assuming screenshot size equals layout size. The UI crop is deterministic CSS; do not regenerate UI text with an image model.

Preview the README and gallery locally at 390 px content width. Check command semantics against `src/layout.js`, readable text, transparent mascot edges, all image links, and preserved source screenshot hashes. Images with English text share the existing translated explanations in the seven localized READMEs. GitHub rendering and store acceptance remain separate from the local preview.

## Selected banner: tab air-traffic control

`push-my-tabs-air-traffic.png` was generated with built-in Imagegen on 2026-10-23. The supplied profile banner was used only as the penguin character reference. The new setting is a midnight-teal control tower with coral, mint, and lavender browser cards following horizontal and vertical flight lanes. It is conceptual illustration, not a product screenshot. The maintainer selected this variant after comparing both options. All eight READMEs embed it at full content width with automatic height; language links remain immediately below. The previous stone-island banner (`push-my-tabs-penguin.png`) and all other original artwork remain available.

Character consistency does not require repeating scenery, composition, or a fixed purple palette. For future variants, derive the environment and action from the project's function and keep the title readable on mobile. Compare alternatives locally before changing the selected banner.

## Theme companions

`banner-themes/air-traffic-light.png` is a light-mode edit of the approved air-traffic banner. `air-traffic-mobile-dark.png` and `air-traffic-mobile-light.png` recompose the same penguin and scene for small screens at a 3:2 ratio. All three were created with built-in Imagegen on 2026-10-23 using the existing project artwork as actual image references. Existing selected banners remain unchanged. Opaque backgrounds keep contrast predictable; the light artwork uses navy lettering and contours instead of a color inversion.

All eight READMEs use native `<picture>`/`<source>` markup: narrow-screen sources precede wide sources and combine `(max-width: 600px)` with `prefers-color-scheme`. The fallback is the existing dark wide banner at full content width with automatic height. Preview fixtures explicitly select each theme to test both branches at 320 px, 390 px, and desktop widths; they do not replace a live GitHub acceptance check. Theme variants must be reviewed together when selected artwork changes. No daily image generation, status metrics, or automation is added.
