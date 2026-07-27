import { chromium } from "playwright";
import fs from "node:fs";

const url = "http://127.0.0.1:4174/";
const outDir = ".shots/handdrawn-verify";
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport, reducedMotion: "reduce", locale: "ru-RU" });
  const consoleErrors = [];
  const failed = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push(String(e)));
  page.on("response", r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("load");
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 3000))]));
  await page.waitForTimeout(500);

  const initial = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    images: [...document.images].map(img => ({ src: img.getAttribute("src"), loaded: img.complete && img.naturalWidth > 0 })),
    tabCount: document.querySelectorAll('[role="tab"]').length,
    selectedTab: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim(),
    disabledDownloads: document.querySelectorAll('#download button:disabled').length,
  }));

  if (viewport.name === "mobile") {
    await page.locator(".nav-toggle").click();
    const open = await page.locator(".nav-toggle").getAttribute("aria-expanded");
    await page.locator('.site-nav a[href="#screenshots"]').click();
    console.log(`[mobile-menu] opened=${open}, closed=${await page.locator(".site-nav").evaluate(el => !el.classList.contains("is-open"))}`);
  }

  const tabs = page.locator('[role="tab"]');
  await tabs.nth(1).click();
  const tabProbe = await page.evaluate(() => ({
    selected: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim(),
    panelLabelledBy: document.querySelector('[role="tabpanel"]')?.getAttribute("aria-labelledby"),
    imageAlt: document.querySelector('[role="tabpanel"] img')?.getAttribute("alt"),
  }));

  await page.locator("#faq").scrollIntoViewIfNeeded();
  const secondFaq = page.locator(".faq-list details").nth(1);
  await secondFaq.locator("summary").click();
  const faqOpen = await secondFaq.getAttribute("open");

  await page.screenshot({ path: `${outDir}/${viewport.name}-full.png`, fullPage: true });
  console.log(JSON.stringify({ viewport: viewport.name, initial, tabProbe, faqOpen: faqOpen !== null, failed, consoleErrors }, null, 2));
  await page.close();
}
await browser.close();
