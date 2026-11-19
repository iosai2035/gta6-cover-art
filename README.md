# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/iosai2035/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/iosai2035/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Leonida Cover Studio — turn your photo into a nine-panel Vice City style cover, offline in the browser. Upload a photo (or try a sample), pick a layout, a duotone grade and a caption, and export a PNG in 1080×1350, 1080×1080 or 1920×1080. The centre panel is your photo in full colour; the eight around it mix alternate crops of the same photo in duotone tints with drawn motif panels (palm, skyline, sports car, flamingo, alligator, helicopter, speedboat, sunset), all finished with a 45° halftone dot screen, a drawn "VI" monogram and bold caption lettering.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No network is needed: every font (Anton and Bungee, SIL Open Font License, under `app/fonts/`) and every sample photo is a file in `app/`, and photos you upload never leave your machine.

## How it works

- `app/src/cover.js` — the poster renderer: sunset background, 3×3 comic grid, duotone + posterize + halftone treatment, the "VI" monogram drawn as artwork, the caption stack and the footer strip with wanted stars.
- `app/src/motifs.js` — the eight drawn motif panels, all original flat vector art painted with canvas paths.
- `app/src/main.js` — the editor: photo upload and samples, drag-to-reframe and zoom, layout and grade controls, caption styles, export.
- `app/src/shots.js` — fixed scenes for the screenshots (`?shot=cover` and `?shot=editor`).

Everything in the poster is original: no Rockstar logo, artwork, photograph or font is used. The "VI" is drawn lettering with a sunset gradient, and the display fonts are OFL-licensed Anton and Bungee.

---

<sub>Entered on [make.fun](https://make.fun/?ref=57z043hx&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
