// Extracts the largest icon embedded in a Windows PE (.exe/.dll) by parsing the
// resource directory directly — no shell API, no 32px shell-cache artifacts.
// Usage: node scripts/extract-pe-icon.mjs <exe> <out.png>
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const [, , exePath, outPng] = process.argv;
const buf = readFileSync(exePath);

const rva2off = (rva) => {
  const numSec = buf.readUInt16LE(buf.readUInt32LE(0x3c) + 6);
  const optHdrSize = buf.readUInt16LE(buf.readUInt32LE(0x3c) + 20);
  const secOff = buf.readUInt32LE(0x3c) + 24 + optHdrSize;
  for (let i = 0; i < numSec; i++) {
    const s = secOff + i * 40;
    const vaddr = buf.readUInt32LE(s + 12);
    const vsize = buf.readUInt32LE(s + 8);
    const raw = buf.readUInt32LE(s + 20);
    if (rva >= vaddr && rva < vaddr + vsize) return rva - vaddr + raw;
  }
  return null;
};

// resource dir RVA = DataDirectory[2] (offset depends on PE32 vs PE32+ magic)
const optHdr = buf.readUInt32LE(0x3c) + 24;
const magic = buf.readUInt16LE(optHdr);
const rsrcRva = magic === 0x20b
  ? buf.readUInt32LE(optHdr + 112 + 16)   // PE32+
  : buf.readUInt32LE(optHdr + 96 + 16);   // PE32
const rsrcBase = rva2off(rsrcRva);

// walk a resource directory; returns map of id -> dataEntryRVA (for leaves) or subDir rva
function readDir(dirOff) {
  const entries = [];
  const numNamed = buf.readUInt16LE(dirOff + 12);
  const numId = buf.readUInt16LE(dirOff + 14);
  let p = dirOff + 16;
  for (let i = 0; i < numNamed + numId; i++) {
    const nameOrId = buf.readUInt32LE(p);
    const offToData = buf.readUInt32LE(p + 4);
    const id = nameOrId & 0x80000000 ? null : nameOrId & 0xffff;
    entries.push({ id, off: offToData & 0x7fffffff, isDir: !!(offToData & 0x80000000) });
    p += 8;
  }
  return entries;
}

// Type level: find RT_GROUP_ICON (14)
const typeEntries = readDir(rsrcBase);
console.log("  type-level ids:", typeEntries.map((e) => e.id).join(","));
const groupType = typeEntries.find((e) => e.id === 14 && e.isDir);
if (!groupType) throw new Error("no RT_GROUP_ICON resource");

// Name level under RT_GROUP_ICON
const nameLevel = readDir(rsrcBase + groupType.off);
// pick first group
const groupDir = nameLevel[0];
// Language level -> data entry
const langLevel = readDir(rsrcBase + groupDir.off);
const dataEntryOff = rsrcBase + langLevel[0].off; // leaf
const dataRva = buf.readUInt32LE(dataEntryOff);
const dataSize = buf.readUInt32LE(dataEntryOff + 4);
const groupOff = rva2off(dataRva);

// parse GRPICONDIR
const count = buf.readUInt16LE(groupOff + 4);
const entries = [];
for (let i = 0; i < count; i++) {
  const e = groupOff + 6 + i * 14;
  const w = buf.readUInt8(e + 0) || 256;
  const h = buf.readUInt8(e + 2) || 256;
  const size = buf.readUInt32LE(e + 8);
  const id = buf.readUInt16LE(e + 12);
  entries.push({ w, h, size, id });
}
console.log("  group entries:", entries.map((e) => `${e.w}x${e.h}#${e.id}`).join(", "));

// find each RT_ICON (3) by id
const iconType = typeEntries.find((e) => e.id === 3 && e.isDir);
const iconNames = readDir(rsrcBase + iconType.off);
const byId = new Map(iconNames.map((e) => [e.id, e]));

// pick the largest entry
entries.sort((a, b) => b.w * b.h - a.w * a.h);
const pick = entries[0];
const iconLang = readDir(rsrcBase + byId.get(pick.id).off);
const iDataOff = rsrcBase + iconLang[0].off;
const iRva = buf.readUInt32LE(iDataOff);
const iSize = buf.readUInt32LE(iDataOff + 4);
const iconBytes = buf.subarray(rva2off(iRva), rva2off(iRva) + iSize);

// assemble .ico: 6-byte header + 16-byte dir entry + image
const hdr = Buffer.alloc(6);
hdr.writeUInt16LE(0, 0);
hdr.writeUInt16LE(1, 2);
hdr.writeUInt16LE(1, 4);
const dent = Buffer.alloc(16);
dent.writeUInt8(pick.w >= 256 ? 0 : pick.w, 0);
dent.writeUInt8(pick.h >= 256 ? 0 : pick.h, 1);
dent.writeUInt32LE(iSize, 8);
dent.writeUInt32LE(6 + 16, 12);
const ico = Buffer.concat([hdr, dent, iconBytes]);
let png;
if (iconBytes.length >= 4 && iconBytes[0] === 0x89 && iconBytes[1] === 0x50) {
  // PNG-compressed icon image (256x256) — decode directly
  png = await sharp(iconBytes).png().toBuffer();
} else {
  png = await sharp(ico, { density: 300 }).png().toBuffer();
}
writeFileSync(outPng, png);
console.log(`${exePath}: ${pick.w}x${pick.h} icon -> ${outPng} (${png.length} B)`);
