// Screenshot the local website (http://localhost:5173) section by section.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? "site-shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

// Force all reveal animations to their end state so nothing is invisible.
await page.addStyleTag({ content: ".reveal{opacity:1 !important;transform:none !important;transition:none !important}" });

const sections = [
  ["hero", ".hero"],
  ["steps", "#benefits"],
  ["showcase", "#screenshots"],
  ["privacy", "#security-intro"],
  ["security", "#security"],
  ["benchmarks", "#benchmarks"],
  ["faq", "#faq"],
  ["download", "#download"],
  ["limitations", "#limitations"],
  ["footer", ".site-footer"],
];
for (const [name, sel] of sections) {
  const el = page.locator(sel).first();
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await el.screenshot({ path: `${OUT}/${name}.png` });
    console.log("ok", name);
  } catch (e) {
    console.log("FAIL", name, String(e).slice(0, 120));
  }
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.addStyleTag({ content: ".reveal{opacity:1 !important;transform:none !important;transition:none !important}" });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/mobile-full.png`, fullPage: true });
console.log("ok mobile-full");
await browser.close();
