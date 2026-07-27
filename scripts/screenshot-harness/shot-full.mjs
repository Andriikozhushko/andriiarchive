import { chromium } from "playwright";
const url = process.env.URL || "http://localhost:5173/";
const out = process.env.OUT || "page-full.png";
const b = await chromium.launch({ channel: "msedge" });
const p = await b.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce", // skip scroll-reveal so every band renders visible
});
await p.goto(url, { waitUntil: "networkidle" });
// nudge scroll to settle any lazy images, then top
await p.evaluate(async () => {
  await new Promise(r => {
    let y = 0;
    const step = () => {
      window.scrollTo(0, y);
      y += 400;
      if (y < document.body.scrollHeight) requestAnimationFrame(step);
      else { window.scrollTo(0, 0); setTimeout(r, 200); }
    };
    step();
  });
});
await p.waitForTimeout(400);
await p.screenshot({ path: out, fullPage: true });
await b.close();
console.log("saved", out);
