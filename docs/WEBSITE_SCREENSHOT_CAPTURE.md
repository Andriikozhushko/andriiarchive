# ANDRII website — screenshot capture

The eight screenshots in `website/public/screenshots/` are **real captures of
the actual ANDRII desktop-app UI**, not mockups. They are produced by the
screenshot harness in `scripts/screenshot-harness/`.

## How it works

The harness is a small Vite app that imports the **real** desktop-app React
components (from `src/`) and renders them in fixed, representative states. The
Tauri runtime is replaced with local mocks (`scripts/screenshot-harness/src/mocks/`)
so the components mount in a plain browser. The app's own `globals.css` and
Tailwind theme are reused, so what renders is pixel-for-pixel the genuine app
UI — only the backend responses (file sizes, the verify verdict, app info) are
canned demo data.

No app source is modified to obtain screenshots.

## Scenes captured

| File | App state |
| --- | --- |
| `home.webp` | Main vault / home screen (create idle) |
| `create-files.webp` | Create-archive flow with selected files |
| `progress.webp` | Sealing progress (streaming bar, files/bytes/ETA) |
| `sealed.webp` | Sealed-archive result screen |
| `open.webp` | Open archive — unlocked file browser |
| `verify-intact.webp` | Verify — seal intact |
| `verify-tampered.webp` | Verify — seal broken (modified archive) |
| `settings.webp` | Settings — language, generator, about |

## Demo data

Scenes use a realistic, non-personal dataset (`atlas-research/...` files) with
no usernames, absolute paths, passwords or secrets. See
`scripts/screenshot-harness/src/scenes.tsx`.

## Re-capturing

Prerequisites (one-time, from the harness directory):

```bash
cd scripts/screenshot-harness
# Playwright is a dependency of the harness. The capture script uses the
# system Microsoft Edge (channel: "msedge"), so no Chromium download is needed.
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install
```

Then capture all eight screenshots (writes to `website/public/screenshots/`):

```bash
cd scripts/screenshot-harness
node capture.mjs
```

The script starts a Vite dev server for the harness, drives each scene with
Playwright at a 1000×640 viewport (×2 device scale), waits for the scene's
signature text to render, and saves a screenshot. Console errors are reported
per scene.

To use Playwright's bundled Chromium instead of Edge:

```bash
npx playwright install chromium
BROWSER=chromium node capture.mjs
```

## Regenerating web-optimised output

`capture.mjs` writes full-resolution PNGs. The committed assets are WebP at
1280px wide. To regenerate them after re-capturing:

```bash
node --input-type=module -e '
import sharp from "sharp"; import fs from "fs";
const dir = "website/public/screenshots";
for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".png"))) {
  await sharp(`${dir}/${f}`).resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 82 }).toFile(`${dir}/${f.replace(".png", ".webp")}`);
  fs.unlinkSync(`${dir}/${f}`);
}'
```
