# Push My Tabs branding

The extension and website use the approved dark **Wingman** penguin app icon, including
a separately drawn 16 px cut. See [the Wingman sources and rebuild guide](wingman/README.md).
The previous extension icons are retained byte-for-byte in `previous-push-p/extension/`,
with SHA-256 hashes in `previous-push-p/SHA256.json`. Previous website icons are
retained in `previous-push-p/website/`. The historical Push P logo kit below remains
available as source artwork. No store artwork is changed here.

## Previous Push P logo kit

Approved direction B, **Push P**, 2026-10-24. The arrow is a transparent counter inside a P: the name and a forward push share one silhouette. The existing purple is retained. All SVG masters contain outlined paths, with no external fonts, rasters, filters or scripts.

![Purple horizontal logo](digital/horizontal-color.png)

## Files

| Need | Use |
| --- | --- |
| Standalone mark | `source/symbol-color.svg`, `symbol-black.svg`, `symbol-white.svg` |
| Narrow toolbar / favicon | `source/symbol-small.svg` (heavier stem; use at 16–32 px) |
| Logo with name | `source/horizontal-*.svg` |
| Compact lockup | `source/stacked-*.svg` |
| Name only | `source/wordmark-*.svg` |
| Dark application tile | `source/app-icon.svg`, `digital/app-icon-1024.png` |
| Circle-safe avatar | `source/social-avatar.svg`, `digital/social-avatar-1024.png` |
| Web icons | `digital/favicon.svg`, `favicon.ico`, `favicon-16/32/48.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `maskable-512.png` |
| Web integration | `digital/head-snippet.html`, `digital/site.webmanifest` (relative URLs; copy the referenced files together) |
| Office / nontransparent use | `digital/horizontal-on-white.jpg` |
| Context and size review | [Presentation](presentation.html), [size strip](size-check.png), `slides/` |
| Previous identity | `previous-directional-key/` retains the original SVG, all extension PNGs and website icons |

## One-page usage guide

- **Colour:** Purple `#8167FF` (RGB 129, 103, 255), Ink `#0B0B10` (11, 11, 16), white `#FFFFFF`. Approximate unprofiled CMYK: purple 49/60/0/0; Ink 31/31/0/94; white 0/0/0/0. These are digital RGB masters; print conversions need a printer's ICC profile. No Pantone match has been verified.
- **Backgrounds:** Purple on white or Ink; black on light backgrounds; white on dark backgrounds. The white symbol has a slightly thinner silhouette and enlarged counter to compensate for its apparent weight. Keep the arrow transparent; never fill it with a fixed background colour.
- **Contrast:** Purple has approximately 3.95:1 against white and 4.97:1 against Ink. Use dark/white text for small body copy rather than purple text on white. Direction is expressed by shape as well as colour.
- **Clear space:** At least 32 units around the symbol on its 256-unit grid; around lockups, use a quarter of the symbol's height. The built-in SVG padding is part of that space.
- **Minimum sizes:** 16 px symbol using the small cut; 24 px regular symbol; 220 px wide horizontal logo; 160 px wide stacked logo; 160 px wide wordmark. Prefer the symbol when text would become too small.
- **Typography:** The wordmark uses outlined Arial Bold from the system font. No font file is distributed and the SVGs do not require a font installation. Any live text should continue using the product's existing type stack. No additional font licence is granted by this kit; check your own font licence before editing typeset originals.
- **Do not:** Stretch, rotate, add gradients or shadows inside the mark, close the counter, place it on busy artwork, or substitute the standard symbol at tiny sizes. Historical screenshots and painted penguin illustrations may retain their original artwork.

## Integration and rebuilding

The extension paths `src/assets/icons/logo.svg` and `icon-16/32/48/128/1024.png` use Wingman. Both manifests, the popup and settings reference those PNG paths. The website also uses Wingman for `website/logo.svg`, its SVG/PNG/ICO favicons, touch icons and web-manifest icons. The SVG favicon and 16 px ICO frame use the independent small cut. The web manifest describes icons only; it does not add a service worker or offline behaviour.

The SVGs under `source/` are authoritative. To change a master, render the six square masters (`symbol-color`, `symbol-small`, `symbol-white`, `app-icon`, `social-avatar`, `icon-maskable`) at **exactly 1024 × 1024**, with transparency and no added padding, into `digital/<name>-1024.png`. Render `horizontal-color.svg` at 1260 × 256 into `digital/horizontal-color.png`. Any conforming SVG renderer can be used; do not capture a tiny browser viewport, since browser minimum viewport sizes can silently change export dimensions.

Then run `python3 docs/branding/export-icons.py` with Pillow available. This resamples the reviewed large renders into exact PNG dimensions with Lanczos filtering, writes the multi-size ICO, and updates the extension, website, web-icon bundle and size strip. Copy updated SVG masters to the runtime SVG paths as described above. Inspect the 16/32 px icons on both light and dark backgrounds. For mobile website previews, use an explicit browser context viewport (for example Playwright at 390 px), and assert `innerWidth` and the document width; headless command-line screenshots can otherwise crop a wider layout. `node scripts/validate-release.mjs` checks the shipped PNG dimensions and manifest references; `./scripts/build-chrome.sh` runs the complete release checks and packages the extension.

## Review and provenance

The user chose the P concept before this kit was built. The concept was constructed from geometric paths; the wordmark was converted to outlines. Source geometry, black/white reproduction, transparent arrow, small-size raster exports, favicon sizes and local website views were checked during integration. [Presentation mockups](presentation.html) are identity examples, not screenshots or proof of installed-extension/store acceptance. The Chrome and Firefox release builds passed; Mozilla web-ext reported zero errors, notices and warnings. Local website contexts at 390 and 1440 px loaded the logos with document width equal to viewport width. Runtime installation and live-store publication were not performed. No trademark clearance or print proofing is claimed.

The prior identity is retained in this directory; original screenshots and painted banners are unchanged. Code and original artwork remain subject to the repository's [MIT License](../../LICENSE), with the font and inherited-asset qualifications above. Store submission, publication and live-browser installation are separate release steps.
