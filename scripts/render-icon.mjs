// Builds src-tauri/icons/icon-1024.png — the icon source for `npx tauri icon`.
//
// Uses the app's sealed chest, src/assets/archive-box.png (the chest used as the
// sealed-vault art in Vault.tsx), composited onto a transparent 1024×1024 square
// so the chest keeps its in-app look at every icon size.
//
// Run: node scripts/render-icon.mjs
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src", "assets", "archive-box.png");
const out = join(root, "src-tauri", "icons", "icon-1024.png");

const chest = await readFile(src);
// Trim transparent margins (if any), then scale the chest to fit a 1024² frame,
// centered on a transparent background.
const png = await sharp(chest)
  .trim({ threshold: 12 })
  .resize(1024, 1024, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();
await writeFile(out, png);
console.log(`wrote ${out} (${png.length} bytes)`);
