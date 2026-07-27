/**
 * Capture the public website at phone width so its mobile layout can actually
 * be looked at, not just measured. Uses system Edge (no Chromium download).
 *
 *   node scripts/screenshot-harness/shot-mobile.mjs [url] [width]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const URL = process.argv[2] || "http://localhost:5173";
const WIDTH = Number(process.argv[3] || 375);
const OUT = join(process.cwd(), ".shots", `mobile-${WIDTH}`);

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({
  viewport: { width: WIDTH, height: 812 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

await page.goto(URL, { waitUntil: "networkidle" });
// Reveal-on-scroll blocks start invisible; force them in so nothing is blank.
await page.addStyleTag({ content: ".reveal{opacity:1 !important;transform:none !important}" });
await page.waitForTimeout(600);

await page.screenshot({ path: join(OUT, "00-full.png"), fullPage: true });

const sections = [
  ["01-hero", ".hero"],
  ["02-bench-stats", ".bench-stats-row"],
  ["03-bench-table", ".bench-table"],
  ["04-versus", ".versus"],
  ["05-crack", ".crack"],
  ["06-format", "#format .panel"],
  ["07-gallery", "#screenshots .panel"],
  ["08-security", "#security .panel"],
  ["09-faq", "#faq .panel"],
  ["10-download", ".cta-panel"],
  ["11-footer", ".site-footer"],
];

for (const [name, sel] of sections) {
  const el = await page.$(sel);
  if (!el) { console.log("missing:", sel); continue; }
  // Sections deliberately hidden at this width (e.g. the benchmark table on
  // phones) must be skipped, not waited on — scrollIntoViewIfNeeded hangs.
  if (!(await el.isVisible())) { console.log("hidden here:", sel); continue; }
  await el.scrollIntoViewIfNeeded();
  // Long enough for the reveal observer to fire AND the 1.1s bar fills to
  // finish — otherwise every bar is captured mid-animation and looks broken.
  await page.waitForTimeout(1600);
  await el.screenshot({ path: join(OUT, `${name}.png`) }).catch(e => console.log(name, e.message));
}

console.log("saved →", OUT);
await browser.close();
