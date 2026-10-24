# Store media plan

Use the current purple Push P and the compact dark interface. Product screenshots and interactions come from the implemented extension; the video should demonstrate navigation and TabLoop, not invent capabilities.

## Recommended production path

Use [Brag](https://latent-spaces.github.io/brag/) for the product story and [HyperFrames](https://github.com/heygen-com/hyperframes) for the HTML/CSS animation and deterministic local MP4 render. This fits the existing web interface and permits reuse of brand assets. [15 Motion Design Styles](https://github.com/Vincentwei1021/mg-styles-15) supplies style references, prompts and examples; it is not an automatic product-video generator.

[Recordly](https://github.com/webadderallorg/Recordly) is the best fit here for the real browser recording: capture actual tab actions and apply zoom/cursor treatment, then use the recording inside the branded composition. Avoid implying that a code-generated illustration is a recording of installed-extension behavior. Brag's current upstream also offers a lean path; the locally installed classic workflow uses HyperFrames. Recheck the selected variant before a production run.

[Remotion](https://github.com/remotion-dev/remotion) is a strong alternative for a React composition with video and still-image variants. It does not require moving the extension UI to React. Check its current license for the producing team before adoption. [OpenMontage](https://github.com/calesthio/OpenMontage) is useful for a broader agent-controlled production with narration, footage and subtitles; that is more machinery than this small UI-led clip needs. [Oil Motion](https://github.com/oil-oil/oil-motion) focuses on generated interactive subject animation and is a weaker match for demonstrating exact tab behavior.

## Proposed 20-second clip

| Time | Scene | Product evidence |
| --- | --- | --- |
| 0–3 s | Purple Push P; “Deine Tabs. Im Fluss.” | Existing logo and dark canvas |
| 3–7 s | Switch tabs with direction keys | Real action, active tab visibly changes |
| 7–11 s | Move the active tab | Tab position visibly changes |
| 11–15 s | TabLoop returns to the last-used tab | Existing recent-tab cycle, without a fake history list |
| 15–18 s | Mac, Windows and Linux bindings | Actual bindings formatted per OS; Control and Command stay distinct |
| 18–20 s | “Push My Tabs” and the install destination | Current Chrome and Firefox listing links |

Keep text readable without audio. Use restrained transitions and optional key-click effects. Narration is optional; no voice cloning or paid generation is needed for this concept.

## Five store images

1. Navigation: switch and move with four direction actions.
2. TabLoop: return to recently used open tabs across windows.
3. Layout: distinguish native detection, estimates and manual confirmation.
4. Shortcuts: actual assignments, platform symbols and browser-specific editing.
5. Settings: language, tab behavior and local settings.

Each image uses one short benefit headline, a large real UI capture and the same purple/dark system. Do not present a simulation as a native OS acceptance result or advertise exact Chrome/Zen orientation detection.

Chrome's [current listing guide](https://developer.chrome.com/docs/webstore/cws-dashboard-listing) allows up to five 1280 × 800 screenshots, a 128 × 128 icon, optional 440 × 280 and 1400 × 560 promotional tiles, and a YouTube video link. Keep promo artwork distinct from screenshots of actual use. Export a 1920 × 1080 landscape MP4 for the proposed video; listing upload/linking remains separate from binary release automation.

This document is a production brief and tool recommendation. It is not a claim that a new video or store artwork has been rendered or uploaded.
