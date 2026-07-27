import sharp from "C:/Users/Andrii/andriiarchive/node_modules/sharp/lib/index.js";
import fs from "node:fs";

const brand = "C:/Users/Andrii/andriiarchive/website/public/brand";
const logoPath = `${brand}/andrii-logo.png`;
const parchment = { r: 243, g: 236, b: 221, alpha: 1 };

/** Composite the wide wordmark, fit to `frac` of the square width, centered. */
async function squareIcon(size, frac, out, bg) {
  const targetW = Math.round(size * frac);
  const logo = await sharp(logoPath).resize({ width: targetW }).toBuffer();
  const meta = await sharp(logo).metadata();
  const top = Math.round((size - meta.height) / 2);
  const left = Math.round((size - meta.width) / 2);
  const base = bg
    ? sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    : sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
  await base.composite([{ input: logo, top, left }]).png().toFile(`${brand}/${out}`);
  console.log(out, `${size}x${size}`);
}

async function og() {
  const W = 1200, H = 630;
  const logo = await sharp(logoPath).resize({ width: 680 }).toBuffer();
  const m = await sharp(logo).metadata();
  await sharp({ create: { width: W, height: H, channels: 4, background: parchment } })
    .composite([{ input: logo, top: Math.round((H - m.height) / 2), left: Math.round((W - m.width) / 2) }])
    .png().toFile(`${brand}/og-image.png`);
  console.log("og-image.png", `${W}x${H}`);
}

await squareIcon(32, 0.92, "favicon-32.png", null);
await squareIcon(16, 0.96, "favicon-16.png", null);
await squareIcon(180, 0.82, "apple-touch-icon.png", parchment);
await squareIcon(512, 0.82, "app-icon.png", parchment);
await og();

// favicon.svg → parchment rounded square embedding the dripping logo
const logoB64 = fs.readFileSync(logoPath).toString("base64");
const meta = await sharp(logoPath).metadata();
const w = 56, h = Math.round((meta.height / meta.width) * w), x = (64 - w) / 2, y = (64 - h) / 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#F3ECDD"/>
  <image x="${x}" y="${y}" width="${w}" height="${h}" href="data:image/png;base64,${logoB64}"/>
</svg>
`;
fs.writeFileSync("C:/Users/Andrii/andriiarchive/website/public/favicon.svg", svg);
console.log("favicon.svg written");
