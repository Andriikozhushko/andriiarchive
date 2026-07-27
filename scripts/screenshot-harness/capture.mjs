/**
 * Captures the eight website screenshots by driving the screenshot harness
 * (a Vite dev server that renders the real ANDRII app components) with
 * Playwright.
 *
 * Usage, from this directory:
 *   node capture.mjs
 *
 * Output: <repo>/website/public/screenshots/*.png
 *
 * Browser: uses the system Microsoft Edge via Playwright's `channel: "msedge"`
 * so no Chromium download is required. Override with `BROWSER=chromium` (after
 * `npx playwright install chromium`) if desired.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// sharp lives in the repo-root node_modules (used to encode the captured PNG
// frames to the optimized WebP the website ships).
const sharp = createRequire(import.meta.url)(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../node_modules/sharp"),
);

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const outDir = path.join(repoRoot, "website/public/screenshots");
const port = Number(process.env.PORT) || 4180;

// (scene hash, output filename, text to wait for before capturing)
const SCENES = [
  ["home", "home.webp", "Drop files to seal"],
  ["create-files", "create-files.webp", "Sealed into one"],
  ["progress", "progress.webp", "Sealing your files"],
  ["sealed", "sealed.webp", "Archive sealed"],
  ["open", "open.webp", "Extract all"],
  ["verify-intact", "verify-intact.webp", "Seal intact"],
  ["verify-tampered", "verify-tampered.webp", "Seal broken"],
  ["settings", "settings.webp", "Settings"],
];

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const r = await fetch(url);
        if (r.ok) return resolve();
      } catch { /* not ready */ }
      if (Date.now() - start > timeoutMs) return reject(new Error(`server at ${url} did not start`));
      setTimeout(tick, 400);
    };
    tick();
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  // Start the harness Vite dev server.
  const viteBin = path.join(repoRoot, "node_modules/vite/bin/vite.js");
  const vite = spawn(process.execPath, [viteBin, "--port", String(port), "--strictPort"], {
    cwd: here,
    stdio: ["ignore", "pipe", "pipe"],
  });
  vite.stdout.on("data", (d) => process.stdout.write(`[vite] ${d}`));
  vite.stderr.on("data", (d) => process.stderr.write(`[vite] ${d}`));

  const base = `http://localhost:${port}/`;
  try {
    await waitForServer(base);
    console.log(`✓ harness dev server ready at ${base}`);

    const { chromium } = await import("playwright");
    const browser = await chromium.launch({
      channel: process.env.BROWSER === "chromium" ? undefined : "msedge",
    });

    let ok = 0;
    for (const [hash, file, waitForText] of SCENES) {
      const page = await browser.newPage({
        viewport: { width: 1000, height: 640 },
        deviceScaleFactor: 2,
        locale: "en-US",
      });
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => consoleErrors.push(String(err)));
      try {
        await page.goto(`${base}#${hash}`, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts && document.fonts.ready);
        await page
          .getByText(waitForText, { exact: false })
          .first()
          .waitFor({ state: "visible", timeout: 20000 });
        // Small settle for fade-in animations and async invoke resolution.
        await page.waitForTimeout(700);
        const dest = path.join(outDir, file);
        // Capture a lossless PNG buffer, then encode to the WebP the site ships.
        const png = await page.screenshot({ fullPage: false });
        await sharp(png).webp({ quality: 82 }).toFile(dest);
        const kb = Math.round(fs.statSync(dest).size / 1024);
        const errNote = consoleErrors.length ? ` ⚠ ${consoleErrors.length} console errors` : "";
        if (errNote) console.log(`   console: ${consoleErrors.slice(0, 3).join(" | ")}`);
        console.log(`  ✓ ${file} (${kb} KB) — waited for "${waitForText}"${errNote}`);
        ok++;
      } catch (e) {
        console.error(`  ✗ ${file} failed: ${e.message}`);
        try { await page.screenshot({ path: path.join(outDir, file.replace(/\.webp$/, ".fail.png")) }); } catch {}
      } finally {
        await page.close();
      }
    }

    await browser.close();
    console.log(`\nCaptured ${ok}/${SCENES.length} screenshots → ${outDir}`);
    if (ok < SCENES.length) process.exitCode = 1;
  } finally {
    vite.kill("SIGTERM");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
