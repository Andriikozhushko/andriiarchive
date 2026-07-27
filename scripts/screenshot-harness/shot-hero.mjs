import { chromium } from "playwright";
const url = process.env.URL || "http://localhost:5173/";
const out = process.env.OUT || "page-hero.png";
const b = await chromium.launch({ channel: "msedge" });
const p = await b.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(400);
await p.screenshot({ path: out }); // viewport only = hero
await b.close();
console.log("saved", out);
