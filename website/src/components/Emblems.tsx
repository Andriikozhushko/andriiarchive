/**
 * Rich brand emblems for the security sections — replacing the thin generic
 * line icons. Two families, both in the "sealed vault" palette:
 *   • CryptoSeal — a pressed bronze/wax medallion per crypto primitive.
 *   • LimitPlate — a two-tone engraved vignette per honest-limit polaroid.
 */

const INK = "#3a2412";
const WAX = "#8f2f24";
const FACE = "#f7ecd6";

/* --------------------------------------------------------- crypto seals --- */

type CryptoKind = "argon" | "xchacha" | "blake";

const SEAL_GLYPH: Record<CryptoKind, JSX.Element> = {
  // Argon2id — a key whose bow is a memory-hard lattice hexagon.
  argon: (
    <g fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 20 L47.8 24.5 L47.8 33.5 L40 38 L32.2 33.5 L32.2 24.5 Z" fill="rgba(58,36,18,.14)" />
      <circle cx="40" cy="29" r="2.6" fill={INK} stroke="none" />
      <path d="M40 38 V55" />
      <path d="M40 48.5 H46.5" />
      <path d="M40 54 H43.5" />
    </g>
  ),
  // XChaCha20-Poly1305 — a padlock with a wax authentication seal.
  xchacha: (
    <>
      <g fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 41 v-5 a8 8 0 0 1 16 0 v5" />
        <rect x="29" y="41" width="22" height="16" rx="3.5" fill={FACE} />
        <circle cx="40" cy="47.5" r="2.4" fill={INK} stroke="none" />
        <path d="M40 49.5 V53.5" />
      </g>
      <g>
        <circle cx="52" cy="54" r="7.4" fill={WAX} stroke="#5b1f18" strokeWidth="1.4" />
        <path d="M48.4 54 l2.5 2.6 l4.1 -5.2" fill="none" stroke="#fdf3e3" strokeWidth="2.4"
              strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </>
  ),
  // BLAKE3 — a fingerprint: a unique mark for unique content.
  blake: (
    <g fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round">
      <path d="M26.5 45 A16 16 0 1 1 53.5 45" />
      <path d="M30 46.5 A12.5 12.5 0 1 1 50 46.5" />
      <path d="M33.5 47 A9 9 0 1 1 46.5 47" />
      <path d="M37 45.5 A4 4 0 1 1 44 47.5 q0 1.5 -1 2.6" />
    </g>
  ),
};

/** A pressed bronze medallion with a beaded rim and an engraved glyph. */
export function CryptoSeal({ kind }: { kind: CryptoKind }) {
  const id = `seal-${kind}`;
  return (
    <svg viewBox="0 0 80 80" className="crypto-seal" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="36%" cy="30%" r="82%">
          <stop offset="0%" stopColor="#f4dca3" />
          <stop offset="48%" stopColor="#d2a55d" />
          <stop offset="100%" stopColor="#996733" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="41.6" r="36" fill="rgba(43,28,12,.24)" />
      <circle cx="40" cy="40" r="36" fill={`url(#${id})`} stroke="#5b3415" strokeWidth="1.8" />
      <circle cx="40" cy="40" r="32" fill="none" stroke="#6b4422" strokeWidth="1" opacity=".45" />
      <circle cx="40" cy="40" r="28.5" fill="none" stroke="#5b3415" strokeWidth="2.2"
              strokeLinecap="round" strokeDasharray="0.1 4.95" opacity=".6" />
      {SEAL_GLYPH[kind]}
    </svg>
  );
}

export const cryptoSealKinds: readonly CryptoKind[] = ["argon", "xchacha", "blake"];

/* --------------------------------------------------------- limit plates --- */

const plate = {
  fill: "none" as const,
  stroke: INK,
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const wax = {
  fill: "none" as const,
  stroke: WAX,
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const LIMIT_PLATE: JSX.Element[] = [
  // 1 — forgotten password can't be recovered: a sealed lock, struck through.
  <svg viewBox="0 0 64 64" key="a" aria-hidden="true">
    <g {...plate}>
      <rect x="18" y="29" width="26" height="20" rx="3.5" fill={FACE} />
      <path d="M23 29v-5a8 8 0 0 1 16 0v5" />
      <circle cx="31" cy="38" r="2.3" fill={INK} stroke="none" />
      <path d="M31 40v4" />
    </g>
    <g {...wax}>
      <circle cx="31" cy="38.5" r="21.5" opacity=".9" />
      <path d="M16 24 46 53" />
    </g>
  </svg>,
  // 2 — no backdoor: a door with a wax "no entry" sign.
  <svg viewBox="0 0 64 64" key="b" aria-hidden="true">
    <g {...plate}>
      <rect x="16" y="13" width="23" height="39" rx="2.5" fill={FACE} />
      <path d="M21 21h13M21 44h13" opacity=".7" />
      <circle cx="35" cy="33" r="1.7" fill={INK} stroke="none" />
    </g>
    <g {...wax}>
      <circle cx="47" cy="20" r="9" />
      <path d="M41 26 53 14" />
    </g>
  </svg>,
  // 3 — no independent audit yet: a magnifier over a doc, wax question mark.
  <svg viewBox="0 0 64 64" key="c" aria-hidden="true">
    <g {...plate}>
      <rect x="13" y="13" width="25" height="32" rx="2.5" fill={FACE} />
      <path d="M18 21h15M18 27h15M18 33h9" opacity=".75" />
      <circle cx="40" cy="39" r="11.5" fill="#fbf7ec" />
      <path d="M48 47 56 55" strokeWidth="3" />
    </g>
    <g fill="none" stroke={WAX} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M37 36a3 3 0 1 1 4.4 2.7c-1.3.8-1.6 1.4-1.6 2.6" />
      <circle cx="40" cy="45.5" r="1.1" fill={WAX} stroke="none" />
    </g>
  </svg>,
  // 4 — keep backups: two stacked plates with a wax refresh loop.
  <svg viewBox="0 0 64 64" key="d" aria-hidden="true">
    <g {...plate}>
      <rect x="12" y="22" width="24" height="29" rx="3" fill="#ecdcbf" />
      <rect x="26" y="12" width="24" height="29" rx="3" fill={FACE} />
      <path d="M31 22h14M31 28h14M31 34h9" opacity=".75" />
    </g>
    <g {...wax}>
      <path d="M52 47a8 8 0 1 1-2.2-9.5" />
      <path d="M50 35.5l-.2 4.2 4.2-.4" />
    </g>
  </svg>,
  // 5 — use a strong password: a masked field with a wax strength spark.
  <svg viewBox="0 0 64 64" key="e" aria-hidden="true">
    <g {...plate}>
      <rect x="10" y="27" width="38" height="18" rx="6" fill={FACE} />
      <circle cx="20" cy="36" r="2.4" fill={INK} stroke="none" />
      <circle cx="29" cy="36" r="2.4" fill={INK} stroke="none" />
      <circle cx="38" cy="36" r="2.4" fill={INK} stroke="none" />
    </g>
    <g fill={WAX} stroke="#5b1f18" strokeWidth="1" strokeLinejoin="round">
      <path d="M50 11l2.1 5.6 5.6 2.1-5.6 2.1L50 26.5l-2.1-5.7-5.6-2.1 5.6-2.1z" />
    </g>
  </svg>,
];

/** The engraved illustration for one honest-limit polaroid (index 0–4). */
export function LimitPlate({ i }: { i: number }) {
  return LIMIT_PLATE[i] ?? null;
}
