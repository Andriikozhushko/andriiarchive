import { useState } from "react";
import { release, downloadsLive } from "../config/release";
import { IconArrow } from "./Icons";

const NAV = [
  { href: "#what", label: "What it does" },
  { href: "#flow", label: "How it works" },
  { href: "#security", label: "Security" },
  { href: "#format", label: "Format" },
  { href: "#benchmarks", label: "Benchmarks" },
  { href: "#download", label: "Download" },
  { href: "#faq", label: "FAQ" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const ctaLabel = downloadsLive ? "Get ANDRII" : "Release status";
  const ctaHref = downloadsLive ? "#download" : "#download";

  return (
    <header className="site-header">
      <div className="wrap">
        <a className="brand-mark" href="#top" onClick={() => setOpen(false)}>
          <img src="./brand/andrii-logo.png" alt="ANDRII" />
        </a>

        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <nav className={`site-nav ${open ? "open" : ""}`} aria-label="Primary">
          {NAV.map(n => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="header-spacer" />

        <div className="header-cta">
          <span className={`release-pill ${downloadsLive ? "live" : ""}`}>
            <span className="dot" />
            v{release.version}
          </span>
          <a className="btn btn-primary" href={ctaHref} onClick={() => setOpen(false)}>
            <span className="btn-text">{ctaLabel}</span>
            <IconArrow />
          </a>
        </div>
      </div>
    </header>
  );
}
