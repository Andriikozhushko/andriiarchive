import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const websiteDir = path.join(repoRoot, "website");
const port = 4173;

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try { const r = await fetch(url); if (r.ok) return resolve(); } catch {}
      if (Date.now() - start > timeoutMs) return reject(new Error("preview did not start"));
      setTimeout(tick, 400);
    };
    tick();
  });
}

const failed = [];
const errors = [];

async function check(viewport, label) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ channel: "msedge" });
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, locale: "en-US" });
  const reqFails = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(`[${label}] ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`[${label}] ${String(e)}`));
  page.on("response", (r) => {
    if (r.status() >= 400) reqFails.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(`http://localhost:${port}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(500);

  // horizontal overflow
  const overflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  const hasOverflow = overflow.scrollW > overflow.clientW + 1;

  // draft-state: download buttons disabled, no draft asset href exposed
  const dlInfo = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("#download .asset-btn")];
    const hrefs = btns.map((b) => b.getAttribute("href")).filter(Boolean);
    return {
      count: btns.length,
      disabled: btns.every((b) => b.hasAttribute("disabled") || b.getAttribute("aria-disabled") === "true"),
      exposesAsset: hrefs.some((h) => h && h.includes("download/")),
    };
  });

  console.log(`\n[${label}] ${viewport.width}×${viewport.height}`);
  console.log(`  horizontal overflow: ${hasOverflow ? "FAIL" : "ok"} (scroll ${overflow.scrollW} > client ${overflow.clientW})`);
  console.log(`  failed requests: ${reqFails.length === 0 ? "none" : reqFails.join("; ")}`);
  console.log(`  download buttons: ${dlInfo.count} total, all disabled=${dlInfo.disabled}, exposes draft asset=${dlInfo.exposesAsset}`);
  if (hasOverflow) failed.push(`overflow@${viewport.width}`);
  if (reqFails.length) failed.push(`broken-assets@${viewport.width}: ${reqFails.join(",")}`);
  if (!dlInfo.disabled || dlInfo.exposesAsset) failed.push(`draft-state@${viewport.width}`);

  await browser.close();
}

const preview = spawn(process.execPath, [path.join(repoRoot, "node_modules/vite/bin/vite.js"), "preview", "--port", String(port), "--strictPort"], {
  cwd: websiteDir, stdio: ["ignore", "ignore", "ignore"],
});

try {
  await waitForServer(`http://localhost:${port}/`);
  console.log("✓ website preview ready");
  await check({ width: 390, height: 844 }, "mobile");
  await check({ width: 768, height: 1024 }, "tablet");
  await check({ width: 1440, height: 900 }, "desktop");
  console.log("\n=== console errors ===");
  console.log(errors.length ? errors.join("\n") : "none");
  console.log("\n=== RESULT ===");
  console.log(failed.length === 0 && errors.length === 0 ? "ALL CHECKS PASSED" : `FAILURES: ${failed.join("; ")}`);
  if (failed.length || errors.length) process.exitCode = 1;
} finally {
  preview.kill("SIGTERM");
}
