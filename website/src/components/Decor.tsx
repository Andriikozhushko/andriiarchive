/** Small decorative primitives for the vintage "sealed vault" look. */

/** Ornamental horizontal divider with a centered diamond, hand-drawn feel. */
export function Flourish({ className }: { className?: string }) {
  return (
    <span className={`flourish${className ? " " + className : ""}`} aria-hidden="true">
      <svg viewBox="0 0 300 24" fill="none" preserveAspectRatio="xMidYMid meet">
        <path d="M6 12h104" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="116" cy="12" r="1.7" fill="currentColor" />
        <path d="M126 12c8 0 11-6 19-6M145 12c-8 0-11 6-19 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".7" />
        <path d="M150 2.5l7.5 9.5-7.5 9.5-7.5-9.5 7.5-9.5z" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="150" cy="12" r="2.1" fill="currentColor" />
        <path d="M174 12c-8 0-11-6-19-6M155 12c8 0 11 6 19 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".7" />
        <circle cx="184" cy="12" r="1.7" fill="currentColor" />
        <path d="M190 12h104" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** A wax seal image accent (uses the real brand asset). */
export function WaxSeal({ className, size = 64 }: { className?: string; size?: number }) {
  return (
    <img
      className={`wax-seal${className ? " " + className : ""}`}
      src="./brand/seal-intact.png"
      alt=""
      aria-hidden="true"
      style={{ width: size, height: size }}
    />
  );
}

/** A small wax-stamp disc with a number, for numbered story steps. */
export function NumberStamp({ n, className }: { n: number; className?: string }) {
  return (
    <span className={`num-stamp${className ? " " + className : ""}`} aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <path
          d="M32 3c4 0 5 4 9 4s6-3 9-1 1 6 3 9 6 3 6 7-4 5-4 9 3 6 1 9-6 1-9 3-3 6-7 6-5-4-9-4-6 3-9 1-1-6-3-9-6-3-6-7 4-5 4-9-3-6-1-9 6-1 9-3 3-6 7-6Z"
          fill="currentColor"
        />
      </svg>
      <em>{n}</em>
    </span>
  );
}

type IconName = "key" | "lock" | "shield" | "noback" | "bolt" | "hash";

/** Vintage line icons for the dark "privacy under seal" band. */
export function VintageIcon({ name }: { name: IconName }) {
  const common = {
    viewBox: "0 0 48 48",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "key":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="16" cy="16" r="8" />
          <circle cx="16" cy="16" r="2.4" />
          <path d="M21.6 21.6 38 38M33 33l4-4M29 29l3-3" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="11" y="21" width="26" height="18" rx="3" />
          <path d="M16 21v-4a8 8 0 0 1 16 0v4" />
          <circle cx="24" cy="29" r="2.2" />
          <path d="M24 31v4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M24 6 39 12v9c0 10-6.5 16.5-15 21-8.5-4.5-15-11-15-21v-9L24 6Z" />
          <path d="m17 24 5 5 10-11" />
        </svg>
      );
    case "noback":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="24" cy="24" r="17" />
          <path d="m16 16 16 16M32 16 16 32" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M26 5 11 27h10l-3 16 18-24H24l2-14Z" />
        </svg>
      );
    case "hash":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M18 8 14 40M34 8l-4 32M9 18h31M8 30h31" />
        </svg>
      );
  }
}
