# Wingman extension app icon

Approved dark variant of concept B: a purple penguin whose right wing is a
direction arrow. Purple `#8167FF`, dark tile `#0B0B10`, white face `#FFFFFF`.
Geometric SVG artwork constructed for this project; no fonts, external images,
filters or generated raster illustration inside the mark.

![Wingman preview](preview.png)

## Sources and deployed sizes

- `wingman-app-dark.svg`: regular dark tile, copied to `src/assets/icons/logo.svg`.
- `app-dark-1024.png`: reviewed render, used for extension PNGs at 32/48/128/1024 px.
- `wingman-app-small.svg`: independent 16 px drawing on the dark tile.
- `app-dark-small-16.png`: reviewed native 16 px render, copied without resampling.
- `wingman-small-16.svg`: tiny symbol without tile; no beak, larger pixel-aligned eyes.
- `wingman-purple.svg`: colour symbol; its white face is deliberately opaque.
- `wingman-black.svg` / `wingman-white.svg`: single-colour symbols with real holes.

The preview also shows a purple tile for comparison; only the **dark** app icon
is deployed. Keep the arrow pointing right, preserve aspect ratio and the tile's
padding. Use the small cut at 16 px; do not shrink the full facial detail into it.
The extension's existing manifest and UI paths remain unchanged.

## Rebuild and retention

With Pillow installed, run `python3 docs/branding/wingman/export-icons.py` from
any directory. The script checks render dimensions before generating PNGs and
copies the reviewed SVG. To change the geometry, render the regular SVG at exactly
1024 × 1024 and the small SVG at exactly 16 × 16 into the named master PNGs first.
Inspect both sizes before exporting. The older `docs/branding/export-icons.py`
also delegates extension exports here while rebuilding the unchanged website kit.

The old extension SVG and PNGs are retained under `../previous-push-p/extension/`.
`../previous-push-p/SHA256.json` records their original hashes. Keep this archive
for rollback; the earlier directional-key identity is also retained separately.
The existing Push P sources and website are not replaced by this change.

Regression lesson: a detailed face becomes crowded at 16 px. Preserve the separate
small drawing through every export route rather than resizing the regular mark.
Local rendering and packaging checks do not imply installation or store approval.
No store upload, release tag or trademark clearance is part of this integration.
