# Landing page

The static site lives in `website/`; extension behavior remains in `src/`. No package install is required. Serve `website/` with a local static server to review changes before publishing.

## Approved direction

The purple wayfinding design uses a navigation rail, a broad title band, and two interactive browser examples. Narrow views (960px or below) use a compact header and stack the examples. Both store links are also available in the mobile hero. Keep the existing Wingman logo and real store destinations.

Dark is the default even when the operating system prefers light. `theme.js` restores an explicitly chosen light theme before the stylesheet loads. The toggle saves only `push-my-tabs-theme` in local storage; unavailable storage must not break switching. Website privacy notices explain this preference. The extension's settings are separate.

The two demos are independent. Switching wraps; moving stops at either edge. Buttons expose their state, and a live status announces actions. Do not intercept actual keyboard shortcuts. Keycaps are labelled as configurable Mac examples, not universal bindings. Command arrows follow the adaptive Shortcut Preset; button text describes the resulting spatial movement.

## Background motion

The decorative Matrix field uses locally generated binary/directional streams and CSS transforms, with no canvas, dependency or frame-by-frame JavaScript. Different sizes, speeds and bright leading glyphs create depth. Keep text, demos and store actions on solid surfaces. Light mode uses a lighter field. The pause control acts for the current visit; reduced-motion preferences show a faint static field. Animations pause when the document is hidden. Verify pause/resume, visibility changes, and live reduced-motion changes before handoff.

## Local verification

- Run `node tests/website-schema.test.mjs` and `node tests/website.test.mjs`.
- Review both themes at desktop and mobile widths. Verify first visit, toggle and reload, both demo switches, reordering, and disabled edge controls.
- Check store destinations without triggering installation, legal-page styling, keyboard focus and horizontal page overflow.
- Before responsive captures, select the intended tab and verify its actual viewport width. A temporary foreground tab can receive the native browser viewport override instead of the page being reviewed.
- Keep functional text at least 11px; use the stacked comparison at tablet widths to keep tab labels readable. These two checks caught issues during the initial implementation review.
- White text on the brand purple has about 3.95:1 contrast: reserve that combination for large or bold display text. Smaller white control text uses the deeper action purple (about 5.09:1).

## Local assets

`fonts/manrope-variable.ttf` is the Manrope variable font from the official Google Fonts repository (`ofl/manrope`); its SIL Open Font License is included beside it. Fonts are served locally, with no third-party font request.

Use clean official brand assets, not generic substitutes or platform-specific app tiles. Give paired Chrome/Firefox logos matching backgrounds: black in dark mode, white in light mode. Keep brand colors and proportions intact. GitHub uses the official Invertocat mark, white on dark and black on light.

Logo sources (retrieved 2026-10-31):

- Chrome: https://www.google.com/chrome/static/images/chrome-logo-m100.svg
- Firefox: https://github.com/mozilla-firefox/firefox/blob/main/browser/branding/official/content/about-logo.svg
- GitHub: https://brand.github.com/foundations/logo (GitHub_Logos.zip, Invertocat Black/White SVG).

Marks identify their corresponding links and remain the property of their owners. The project MIT license does not replace third-party font or trademark terms.
