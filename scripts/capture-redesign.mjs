// Capture the current landing AND the redesign route at localhost:5173
// using the system Edge browser (no Chromium download).
import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// playwright lives in the screenshot-harness subtree
const pwPath = path.resolve("scripts/screenshot-harness/node_modules/playwright");
const { chromium: pwChromium } = require(pwPath);

const url = "http://localhost:5173/";
const out = path.resolve("docs/redesign-shots");
fs.mkdirSync(out, { recursive: true });

const SHOTS = [
  { hash: "",            file: "current.png",   label: "Current design" },
  { hash: "#redesign",   file: "redesign.png",  label: "Editorial redesign" },
];

const VIEWS = [
  { name: "desktop", width: 1440, height: 900,  fullPage: true  },
  { name: "fold",    width: 1440, height: 900,  fullPage: false },
  { name: "mobile",  width: 414,  height: 820,  fullPage: true  },
];

const browser = await pwChromium.launch({ channel: "msedge" });

let ok = 0;
for (const shot of SHOTS) {
  for (const view of VIEWS) {
    const page = await browser.newPage({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: 1,
      locale: "ru-RU",
    });
    const errs = [];
    page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
    page.on("pageerror", e => errs.push(String(e)));
    try {
      await page.goto(`${url}${shot.hash}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      await page.waitForTimeout(900); // settle reveal + scroll handlers
      const file = path.join(out, `${shot.hash.replace("#", "") || "current"}-${view.name}.png`);
      await page.screenshot({ path: file, fullPage: view.fullPage });
      const kb = Math.round(fs.statSync(file).size / 1024);
      const err = errs.length ? ` ⚠ ${errs.length} console errs` : "";
      console.log(`  ✓ ${shot.label} · ${view.name} → ${path.basename(file)} (${kb} KB)${err}`);
      ok++;
    } catch (e) {
      console.error(`  ✗ ${shot.label} · ${view.name} failed: ${e.message}`);
    } finally {
      await page.close();
    }
  }
}
await browser.close();
console.log(`\nCaptured ${ok}/${SHOTS.length * VIEWS.length} → ${out}`);
