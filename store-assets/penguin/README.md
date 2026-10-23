# Penguin artwork

Artwork refresh, 2026-10-23. Original store files and UI screenshots are preserved. These files have not been uploaded to either extension store.

## Exports

- `promo/push-my-tabs-440x280.png`: compact promotional tile.
- `promo/push-my-tabs-1400x560.png` and `.jpg`: wide promotional image and social-preview candidate.
- `promo/small-source.png` and `wide-source.png`: generated source artwork.
- `marketing/01-…05-*.png`: 1280 × 800 cards combining the new penguin with existing UI screenshots. Source mapping, copy and deterministic layout live in `marketing/cards.json` and `marketing/render-cards.mjs`.

The painted character and promotional illustrations were created with built-in Imagegen using the approved project banner as reference. Marketing UI crops are existing project screenshots, not model-generated interfaces. The UI icon and all original assets remain unchanged. See [asset provenance](../../docs/assets/README.md).

## Optional production tools

These tools were evaluated through their official repository pages as possible production workflows. This asset set uses built-in Imagegen, existing FFmpeg, and local HTML layouts; none of the tools below was installed or connected.

| Repository | Practical use here | Decision |
| --- | --- | --- |
| [Remotion](https://github.com/remotion-dev/remotion) | React-driven video and repeatable animated demo compositions | Useful for a future continuous explainer; the current three-scene GIF only needs existing FFmpeg. Its special licensing needs review before use. |
| [Higgsfield Skills](https://github.com/higgsfield-ai/skills) | Brand, product-photoshoot and marketplace-card workflows | Useful workflow reference; current work uses the already available built-in Imagegen, with no extra account or provider setup. |
| [Design DNA](https://github.com/zanwei/design-dna) | Extract a reusable style profile from image/UI references | Useful for consistent color, type and composition; no installation needed for this bounded refresh. |
| [OpenCreator](https://github.com/krillinai/OpenCreator) | Broader agent-driven image, video and voice workspace | More setup than this asset set requires; not installed or connected. |

This is a project-local research note, not proof that any tool has been installed, tested, or licensed for this project.
