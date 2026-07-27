/**
 * Clean, single-weight line icons (lucide-style, currentColor stroke).
 * Generic UI glyphs for chips, lists, buttons, cards — not brand illustrations.
 */
import type { SVGProps, ReactElement } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconCheck = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M20 6 9 17l-5-5" /></svg>
);
export const IconAlert = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
);
export const IconArrow = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconArrowRight = IconArrow;
export const IconDownload = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 3v12M7 10l5 5 5-5" /><path d="M5 21h14" /></svg>
);
export const IconChevron = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconLock = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
);
export const IconShield = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /></svg>
);
export const IconShieldCheck = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const IconNoCloud = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1.5" /><path d="M17 18a3 3 0 0 0 0-6" /><path d="M4 4l16 16" /></svg>
);
export const IconCpu = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
);
export const IconGithub = ({ size = 18, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 1.5A10.5 10.5 0 0 0 1.5 12c0 4.64 3 8.57 7.18 9.96.53.1.72-.23.72-.51v-1.8c-2.92.64-3.54-1.4-3.54-1.4-.48-1.21-1.17-1.54-1.17-1.54-.95-.65.07-.64.07-.64 1.06.08 1.61 1.09 1.61 1.09.94 1.61 2.46 1.14 3.06.87.1-.68.37-1.14.67-1.4-2.33-.27-4.78-1.17-4.78-5.2 0-1.15.41-2.09 1.08-2.83-.11-.27-.47-1.34.1-2.8 0 0 .88-.28 2.88 1.08a9.9 9.9 0 0 1 5.24 0c2-1.36 2.88-1.08 2.88-1.08.57 1.46.21 2.53.1 2.8.67.74 1.08 1.68 1.08 2.83 0 4.04-2.46 4.93-4.8 5.19.38.33.71.97.71 1.96v2.9c0 .29.19.62.72.51A10.5 10.5 0 0 0 22.5 12 10.5 10.5 0 0 0 12 1.5Z" /></svg>
);
export const IconFiles = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 7a2 2 0 0 1 2-2h7l5 5v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" /><path d="M9 13h6M9 17h4" /></svg>
);
export const IconKey = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="8" cy="8" r="4" /><path d="M11 11l8 8" /><path d="m16 16 2-2M19 19l2-2" /></svg>
);
export const IconFolder = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>
);
export const IconLayers = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></svg>
);
export const IconGauge = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 14 16 9" /><path d="M4 18a8 8 0 1 1 16 0" /><circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none" /></svg>
);
export const IconEyeOff = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.4 5.2A9.5 9.5 0 0 1 12 5c6 0 9 7 9 7a13 13 0 0 1-2.2 3M6.1 6.1A13 13 0 0 0 3 12s3 7 9 7a9.4 9.4 0 0 0 4.2-1" /></svg>
);
export const IconFingerprint = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 4a8 8 0 0 0-8 8v3" /><path d="M12 8a4 4 0 0 0-4 4v3a8 8 0 0 0 .7 3.3" /><path d="M12 12v4a4 4 0 0 0 .8 2.4" /><path d="M16 9a4 4 0 0 1 0 7" /><path d="M20 12a8 8 0 0 0-2-5.3" /></svg>
);
export const IconSparkles = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z" /><path d="M18 15l.7 1.8L20.5 17.5 18.7 18.2 18 20l-.7-1.8L15.5 17.5 17.3 16.8 18 15Z" /></svg>
);
export const IconTerminal = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3M13 15h4" /></svg>
);
export const IconArchive = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /><path d="M12 12v3M10 14h4" /></svg>
);
export const IconBolt = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" /></svg>
);
export const IconGlobe = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14.5 14.5 0 0 1 0 18 14.5 14.5 0 0 1 0-18Z" /></svg>
);

/** Small illustrative GPU: shroud with two fans, bracket and PCIe fingers. */
export const IconGpu = ({ size = 40 }: P) => (
  <svg width={size * 1.75} height={size} viewBox="0 0 70 40" aria-hidden="true">
    {/* bracket */}
    <rect x="2" y="4" width="4" height="30" rx="1.4" fill="#8b8272" />
    <circle cx="4" cy="8" r="1.1" fill="#f6f3ec" />
    <circle cx="4" cy="30" r="1.1" fill="#f6f3ec" />
    {/* shroud */}
    <rect x="7" y="6" width="60" height="24" rx="4" fill="#2a2420" />
    <rect x="7" y="6" width="60" height="24" rx="4" fill="none" stroke="#4a4038" strokeWidth="1.4" />
    {/* fans */}
    <g stroke="#8b8272" strokeWidth="1.5" fill="none">
      <circle cx="24" cy="18" r="8" />
      <circle cx="49" cy="18" r="8" />
    </g>
    <g fill="#6f6455">
      <circle cx="24" cy="18" r="2" />
      <circle cx="49" cy="18" r="2" />
    </g>
    <g stroke="#6f6455" strokeWidth="1.3" strokeLinecap="round">
      <path d="M24 12.4v3M24 20.6v3M18.4 18h3M26.6 18h3" />
      <path d="M49 12.4v3M49 20.6v3M43.4 18h3M51.6 18h3" />
    </g>
    {/* accent stripe + PCIe fingers */}
    <rect x="10" y="8.4" width="54" height="1.8" rx="0.9" fill="#b4490d" opacity="0.85" />
    <rect x="14" y="30" width="26" height="4" rx="1" fill="#8f6b1f" />
    <g fill="#2a2420">
      <rect x="17" y="30" width="1.6" height="4" />
      <rect x="21" y="30" width="1.6" height="4" />
      <rect x="25" y="30" width="1.6" height="4" />
      <rect x="29" y="30" width="1.6" height="4" />
      <rect x="33" y="30" width="1.6" height="4" />
    </g>
  </svg>
);

/* ── Brand marks (filled, single-color, currentColor) ──────────────────── */

/** Windows logo — four panes in the Microsoft brand colours. */
export const IconWindows = ({ size = 18, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...p}>
    <rect x="1.5" y="1.5" width="9.5" height="9.5" rx="1" fill="#F35325" />
    <rect x="13" y="1.5" width="9.5" height="9.5" rx="1" fill="#81BC06" />
    <rect x="1.5" y="13" width="9.5" height="9.5" rx="1" fill="#05A6F0" />
    <rect x="13" y="13" width="9.5" height="9.5" rx="1" fill="#FFBA08" />
  </svg>
);

/** Tux — the Linux penguin, clean flat mark. */
export const IconTux = ({ size = 18, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 64 64" {...p}>
    {/* feet */}
    <path fill="#F8B419" d="M26.5 50.5c.4 4.2-1.2 7.2-5.6 9-2.3 1-4.6.4-4.7-1.4-.1-1.8 1.4-2.6 2.8-4 1.8-1.8 2.5-3.7 2.6-5.6l4.9 2Z" />
    <path fill="#F8B419" d="M37.5 50.5c-.4 4.2 1.2 7.2 5.6 9 2.3 1 4.6.4 4.7-1.4.1-1.8-1.4-2.6-2.8-4-1.8-1.8-2.5-3.7-2.6-5.6l-4.9 2Z" />
    {/* body */}
    <path fill="#15110D" d="M32 4c-7.7 0-11 6.4-11 13.7 0 3.4.2 5.4-2.3 8.7-2.9 3.8-5.7 7-5.7 12.9 0 4 1.9 7.4 4.9 9.8 1.7 1.4 3.4 0 4.2-1.1 1.7 2.6 5.6 4.4 9.9 4.4s8.2-1.8 9.9-4.4c.8 1.1 2.5 2.5 4.2 1.1 3-2.4 4.9-5.8 4.9-9.8 0-5.9-2.8-9.1-5.7-12.9-2.5-3.3-2.3-5.3-2.3-8.7C43 10.4 39.7 4 32 4Z" />
    {/* belly */}
    <path fill="#F4F2EB" d="M32 23.5c-5.3 0-8.6 6-8.6 15.1 0 6.6 3.5 12.4 8.6 12.4s8.6-5.8 8.6-12.4c0-9.1-3.3-15.1-8.6-15.1Z" />
    {/* white eye mask */}
    <path fill="#fff" d="M32 11.2c-2.9 0-5.3 2.7-5.3 6 0 3.3 2.4 6 5.3 6s5.3-2.7 5.3-6c0-3.3-2.4-6-5.3-6Z" />
    {/* pupils */}
    <ellipse cx="29.7" cy="16.8" rx="1.5" ry="2.2" fill="#15110D" />
    <ellipse cx="34.3" cy="16.8" rx="1.5" ry="2.2" fill="#15110D" />
    {/* beak */}
    <path fill="#F8B419" d="M28.4 17.2c0-2 1.6-3.4 3.6-3.4s3.6 1.4 3.6 3.4c0 1.4-1.6 2.3-3.6 2.3s-3.6-.9-3.6-2.3Z" />
    <path fill="#E08A0E" d="M28.6 18.4c.7 1.2 2 1.9 3.4 1.9s2.7-.7 3.4-1.9c-.9.6-2.1 1-3.4 1s-2.5-.4-3.4-1Z" />
  </svg>
);

/** Monochrome Windows flag — inherits the button's text colour. */
export const IconWindowsGlyph = ({ size = 18, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M3 5.1 10.5 4v7.4H3V5.1Zm8.5-1.2L21 2.5v8.9h-9.5V3.9ZM3 12.6h7.5V20L3 18.9v-6.3Zm8.5 0H21v8.9l-9.5-1.4v-7.5Z" />
  </svg>
);

/** Official Tux (Larry Ewing) — full-colour penguin, served as an asset. */
export const IconTuxGlyph = ({ size = 18 }: P) => (
  <img
    src="./brand/tux.svg"
    alt=""
    aria-hidden="true"
    style={{ height: size, width: "auto", display: "block" }}
  />
);

/* ── Comparison brand marks (tasteful tiles, not the trademarked logos) ─── */

/** ANDRII — the chest brand mark (the blue-shield app-icon.png is off-brand here). */
export const LogoAndrii = ({ size = 28 }: P) => (
  <img src="./brand/chest-open.png" alt="" aria-hidden="true"
    style={{ width: size, height: size, objectFit: "contain", display: "block" }} />
);

/** White rounded tile holding a real brand logo image. */
const brandTile = (size: number) => ({
  width: size, height: size, borderRadius: 9,
  background: "#fff", boxShadow: "inset 0 0 0 1px rgba(70,50,30,.12)",
  display: "grid", placeItems: "center", overflow: "hidden",
} as const);

/** WinRAR — official icon (Wikimedia Commons). */
export const LogoWinrar = ({ size = 28 }: P) => (
  <span style={brandTile(size)}>
    <img src="./brand/winrar.svg" alt="" aria-hidden="true"
      style={{ width: "84%", height: "84%", objectFit: "contain" }} />
  </span>
);

/** 7-Zip — official icon (Wikimedia Commons). */
export const LogoSevenzip = ({ size = 28 }: P) => (
  <span style={brandTile(size)}>
    <img src="./brand/sevenzip.svg" alt="" aria-hidden="true"
      style={{ width: "76%", height: "76%", objectFit: "contain" }} />
  </span>
);

/** Windows — built-in Explorer ZIP, the four-pane flag. */
export const LogoWindows = ({ size = 28 }: P) => (
  <span style={brandTile(size)}>
    <svg width="66%" height="66%" viewBox="0 0 24 24">
      <rect x="1.5" y="1.5" width="9.5" height="9.5" rx="1" fill="#F35325" />
      <rect x="13" y="1.5" width="9.5" height="9.5" rx="1" fill="#81BC06" />
      <rect x="1.5" y="13" width="9.5" height="9.5" rx="1" fill="#05A6F0" />
      <rect x="13" y="13" width="9.5" height="9.5" rx="1" fill="#FFBA08" />
    </svg>
  </span>
);

/** WinZip — the yellow vise/clamp motif on a tile. */
export const LogoWinzip = ({ size = 28 }: P) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <rect x="1.5" y="1.5" width="37" height="37" rx="9" fill="#F7B500" />
    <rect x="16" y="16" width="8" height="8" rx="1" fill="#1f1f1f" />
    <path d="M14 11 H9 V29 H14M26 11 H31 V29 H26" fill="none" stroke="#1f1f1f" strokeWidth="3" strokeLinejoin="round" />
    <path d="M31 20 H35" stroke="#1f1f1f" strokeWidth="3" strokeLinecap="round" />
    <circle cx="35.5" cy="20" r="2.2" fill="#1f1f1f" />
  </svg>
);

/** Logo lookup keyed by CompareTool.key. */
export const compareLogo: Record<string, (p: P) => ReactElement> = {
  andrii: LogoAndrii,
  winrar: LogoWinrar,
  sevenzip: LogoSevenzip,
  winzip: LogoWinzip,
  windows: LogoWindows,
};
