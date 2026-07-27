# ANDRII — website

The public product website for [ANDRII](https://github.com/Andriikozhushko/andriiarchive),
a local-first encrypted archive app. This is a standalone static site, built and
deployed independently of the desktop application.

## Stack

- React 18 + TypeScript
- Vite 5
- Plain CSS (parchment / ink / wax theme ported from the desktop app)
- No backend, no database, no analytics, no auth

The site reuses the project's own visual assets (wordmark, app icon, hand-drawn
ink motifs) and **real screenshots** of the desktop app — see
[`docs/WEBSITE_SCREENSHOT_CAPTURE.md`](../docs/WEBSITE_SCREENSHOT_CAPTURE.md) for
how screenshots are produced.

## Develop

```bash
cd website
npm install
npm run dev      # http://localhost:5173
```

## Build & preview

```bash
npm run build    # type-check + production build → dist/
npm run preview  # serve the production build locally
```

## Release / download state

Downloads are driven by a single config file:
[`src/config/release.ts`](src/config/release.ts).

The GitHub release for v1.0.0 is currently an **unpublished draft**, so
`releaseState` is `"draft"`: every download button is disabled and no
private/draft asset URL is exposed anywhere on the site.

To activate public downloads after the release is manually published:

1. Publish the GitHub release (from the GitHub UI — never from this repo).
2. Set `releaseState` to `"published"` in `src/config/release.ts`.

No other code change is required — every download button derives its state and
href from that file. Asset URLs default to the standard GitHub Releases
`releases/download/<tag>/<filename>` convention, so they usually need no edit.

## Structure

```
website/
  index.html              # meta, Open Graph, fonts
  public/
    brand/                # project-owned visual assets (logo, icons, seals)
    screenshots/          # real desktop-app captures (.webp)
    favicon.svg
  src/
    config/release.ts     # release state + asset URLs (single source of truth)
    config/site.ts        # static copy
    data/                 # verified benchmark figures + FAQ
    components/           # Art (ink motifs), Header, Footer, Shot, etc.
    sections/             # Hero, WhatItDoes, ProductFlow, Security, Format,
                          # Benchmarks, Gallery, Downloads, Faq
    App.tsx, main.tsx, styles.css
```

## Deployment

The build output in `dist/` is fully static and can be served from any static
host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3 + CloudFront, …).
Point a custom domain at it when ready. No server-side configuration is needed.
