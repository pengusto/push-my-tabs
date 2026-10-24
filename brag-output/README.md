# Push My Tabs media kit

- `brag.mp4`: finished 21.5-second 1920 × 1080 / 30 fps H.264 + AAC product walkthrough.
- `brag.jpg`: settled poster, also baked into frame zero.
- `store-images/{navigation,tabloop,layout,shortcuts,settings}.png`: five 1280 × 800 store images.
- `store-images/all-five.png`: contact sheet.
- `share-copy.txt`: short German caption.
- `composition/`: editable HyperFrames 0.8.191 composition and the original UI clips.

The original logo and purple palette are unchanged. The captured Chrome UI uses real macOS platform/command values. Windows/Linux labels are marked as formatting examples. Layout and Settings controls change in the actual UI recordings; native tab-bar movement and Firefox recordings are not claimed.

The intended Recordly capture did not work: its source picker stayed empty after permission setup. Importing a valid UI MP4 displayed “Media imported” but left the editor at “No video to load”. The delivered clip therefore uses verified UI recordings and HyperFrames. Recordly remains installed for a later capture session.

## Rebuild

Use Node 22+, FFmpeg and HyperFrames 0.8.191. `node scripts/store-media/build-film.mjs` rebuilds the composition from its retained UI clips; optional `RECORDINGS_DIR` supplies replacement clips. Refresh the screenshots with `scripts/store-media/capture.mjs` after `scripts/build-chrome-dev.sh`; it requires `PLAYWRIGHT_MODULE` and `CHROME_EXECUTABLE` pointing at the local capture toolchain. Export the five images with `scripts/store-media/store-images.mjs` and the same Playwright variable.

For video rendering, copy the installed Brag vol-12 music into `composition/assets/music/`, its extracted audio data into `audio-data.json`, and GSAP 3.14.2 into `composition/assets/gsap.min.js`. The full music track and generated runtime/cache files stay local. Source credits are in `composition/assets/SOURCES.md`.

Run the composition's pinned `check` script before its `render` script. Inspect decoded MP4 frames as well as preview snapshots: successful preview checks do not prove the final MP4 layout. Keep all new outputs separate from the earlier penguin kit.
