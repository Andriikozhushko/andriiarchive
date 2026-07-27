import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { release, downloadsLive, assetUrl, checksumsUrl, type PlatformAsset } from "./config/release";
import { site } from "./config/site";
import { I18nProvider, useI18n, fmt, yearWord, langPath, LANGS } from "./i18n";
import {
  IconWindowsGlyph,
  IconTuxGlyph,
  IconDownload,
  IconGithub,
  IconNoCloud,
  IconShieldCheck,
  IconKey,
  IconGlobe,
  IconChevron,
  compareLogo,
} from "./components/Icons";
import {
  benchmarkRows,
  benchmarkDocsUrl,
  comparison,
  compareTools,
  crackAlphabet,
  crackRatePerSec,
  crackGpuCount,
  crackGpuName,
} from "./data/benchmarks";

/* ------------------------------------------------------------- Static data */

const NAV_HREFS = ["#top", "#benchmarks", "#format", "#screenshots", "#security", "#faq", "#download"] as const;

const HERO_BADGES = ["XChaCha20-Poly1305", "Argon2id", "BLAKE3", "Open source"] as const;

const STATS = [
  { value: "79.8%", pct: 79.8 },
  { value: "54.8%", pct: 54.8 },
  { value: "0%", pct: 0 },
] as const;

const SHOT_IMGS = [
  "./screenshots/create-files.webp",
  "./screenshots/open.webp",
  "./screenshots/verify-intact.webp",
  "./screenshots/home.webp",
  "./screenshots/progress.webp",
] as const;

const SECURITY_NAMES = ["Argon2id", "XChaCha20-Poly1305", "BLAKE3"] as const;

const LAYER_TONES = ["head", "kdf", "data", "seal"] as const;

/* ------------------------------------------------------------------ Hooks */

/** Scroll progress 0→1 over the first `max` pixels. */
function useScrollProgress(max = 300) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => setP(Math.min(1, Math.max(0, window.scrollY / max)));
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [max]);
  return p;
}

/** Track which nav section is currently in view (for the header underline). */
function useActiveSection(hrefs: readonly string[]) {
  const [active, setActive] = useState(hrefs[0] ?? "");
  useEffect(() => {
    const onScroll = () => {
      const line = window.scrollY + window.innerHeight * 0.32;
      let cur = hrefs[0] ?? "", best = -Infinity;
      for (const href of hrefs) {
        const el = document.getElementById(href.slice(1));
        if (!el) continue;
        const top = el.offsetTop;
        if (top <= line && top >= best) { best = top; cur = href; }
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        cur = hrefs[hrefs.length - 1];
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [hrefs]);
  return active;
}

/** Stagger-reveal common blocks as they scroll into view. */
function useReveal() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const groups = [
      ".section-heading", ".format-point", ".format-file",
      ".security-card", ".versus", ".bench-stat", ".bench-table", ".crack",
      ".bench-notes p", ".faq-aside", ".faq-list details", ".download-card",
    ];
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
    );
    for (const sel of groups) {
      document.querySelectorAll<HTMLElement>(sel).forEach((el, i) => {
        el.classList.add("reveal");
        el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
        io.observe(el);
      });
    }
    return () => io.disconnect();
  }, []);
}

export default function App() {
  return (
    <I18nProvider>
      <Site />
    </I18nProvider>
  );
}

function Site() {
  const { L } = useI18n();
  useReveal();
  return (
    <>
      <a className="skip-link" href="#main">{L.skip}</a>
      <Header />
      <main id="main">
        <Hero />
        <Benchmarks />
        <Format />
        <Showcase />
        <Security />
        <Faq />
        <Download />
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ Header */

function LangSwitch() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`lang-switch${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="lang-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        onClick={() => setOpen(v => !v)}
      >
        <IconGlobe size={15} />
        <span>{lang.toUpperCase()}</span>
        <IconChevron size={13} />
      </button>
      {open && (
        <ul className="lang-menu" role="listbox" aria-label="Language">
          {LANGS.map(l => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                className={l.code === lang ? "is-active" : undefined}
                onClick={() => { setLang(l.code); setOpen(false); }}
              >
                <i className="lang-path">{langPath(l.code)}</i>
                <span>{l.native}</span>
                {l.code === lang && <b aria-hidden="true">✓</b>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Header() {
  const { L } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const p = useScrollProgress();
  const scrolled = p > 0.04;
  const active = useActiveSection(NAV_HREFS);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`} id="top">
      <div className="wrap header-wrap">
        <a className="brand" href="#top" aria-label="ANDRII">
          <img src="./brand/andrii-logo.png" alt="ANDRII" />
        </a>
        <nav id="primary-navigation" className={`site-nav${menuOpen ? " is-open" : ""}`}>
          {L.nav.map((label, i) => (
            <a
              key={NAV_HREFS[i]}
              href={NAV_HREFS[i]}
              className={NAV_HREFS[i] === active ? "is-active" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="header-side">
          <LangSwitch />
          <a className="header-cta" href="#download">
            <IconDownload size={16} /> {L.headerCta}
          </a>
        </div>
        <button
          className={`nav-toggle${menuOpen ? " is-open" : ""}`}
          aria-label="Menu"
          aria-controls="primary-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------- Hero */

/**
 * One line of the hero headline. Dictionaries mark an optional break with "|":
 * the halves run together on desktop and stack on phones, so the headline is
 * two lines there and four here without the wrap landing wherever it likes.
 */
function HeroLine({ text }: { text: string }) {
  return (
    <>
      {text.split("|").map((part, i) => (
        <span className="ht-part" key={part}>{i > 0 ? " " : ""}{part}</span>
      ))}
    </>
  );
}

function Hero() {
  const { L } = useI18n();
  return (
    <section
      className="hero"
      style={{
        "--hero-img": "url(./brand/hero-scene.jpg)",
        // Phones get a purpose-made portrait crop; letting `cover` squeeze the
        // 1.6:1 landscape into a tall window zoomed it past recognition.
        "--hero-img-m": "url(./brand/hero-scene-portrait.jpg)",
      } as CSSProperties}
    >
      <div className="wrap hero-wrap">
        <div className="hero-copy">
          <p className="kicker">{L.hero.kicker}</p>
          <h1 className="display hero-title">
            <HeroLine text={L.hero.title1} /><br className="ht-br" /><HeroLine text={L.hero.title2} />
          </h1>
          <p className="hero-lead">{L.hero.lead}</p>
          <div className="hero-actions">
            <DownloadCta variant="windows" />
            <DownloadCta variant="linux" />
          </div>
          <ul className="trust-row">
            <li><IconNoCloud size={16} /> {L.hero.trust[0]}</li>
            <li><IconShieldCheck size={16} /> {L.hero.trust[1]}</li>
            <li><IconKey size={16} /> {L.hero.trust[2]}</li>
          </ul>
          <ul className="hero-badges" aria-label="Crypto">
            {HERO_BADGES.map(b => <li key={b}>{b}</li>)}
          </ul>
        </div>
      </div>
      <img className="hero-scene-m" src="./brand/hero-scene.jpg" alt={L.hero.sceneAlt} loading="eager" />
    </section>
  );
}

/* ---------------------------------------------------------- Format .andrii */

function Format() {
  const { L } = useI18n();
  return (
    <section className="section format-section" id="format">
      <div className="wrap">
        <div className="panel panel-paper">
        <SectionHeading kicker={L.format.kicker} title={L.format.title} lead={L.format.lead} />
        <div className="format-grid">
          <div className="format-points">
            {L.format.points.map(item => (
              <article className="format-point" key={item.t}>
                <h3>{item.t}</h3>
                <p>{item.b}</p>
              </article>
            ))}
          </div>
          <figure className="format-file" aria-label={L.format.fileAria}>
            <figcaption className="ff-name"><span>vacation-2026</span>.andrii</figcaption>
            <div className="ff-layers">
              {L.format.layers.map((l, i) => (
                <div className={`ff-layer is-${LAYER_TONES[i]}`} key={l.n}>
                  <b>{l.n}</b>
                  <small>{l.d}</small>
                </div>
              ))}
            </div>
            <img className="ff-seal" src="./brand/seal-intact.png" alt="" aria-hidden="true" loading="lazy" />
          </figure>
        </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Showcase */

function Showcase() {
  const { L } = useI18n();
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const shots = L.shots.items;

  const goTo = (i: number) => {
    const el = trackRef.current;
    const next = Math.max(0, Math.min(shots.length - 1, i));
    activeRef.current = next;
    setActive(next);
    el?.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== activeRef.current) { activeRef.current = i; setActive(i); }
  };

  /* Vertical wheel over the strip flips slides; at the edges the page scrolls on. */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let lockUntil = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const next = activeRef.current + dir;
      if (next < 0 || next >= SHOT_IMGS.length) return;
      e.preventDefault();
      const now = performance.now();
      if (now < lockUntil || Math.abs(e.deltaY) < 8) return;
      lockUntil = now + 450;
      activeRef.current = next;
      setActive(next);
      el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section className="section showcase-section" id="screenshots">
      <div className="wrap">
        <div className="panel panel-deep">
        <SectionHeading kicker={L.shots.kicker} title={L.shots.title} lead={L.shots.lead} />
        <div className="gallery-tabs">
          <div className="gt-tabs" role="tablist" aria-label={L.shots.aria}>
            {shots.map((item, i) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-controls="showcase-panel"
                id={`showcase-tab-${i}`}
                tabIndex={i === active ? 0 : -1}
                className={`gt-tab${i === active ? " is-active" : ""}`}
                onClick={() => goTo(i)}
              >
                {item.title}
                <small>{item.note}</small>
              </button>
            ))}
          </div>
          <div
            className="window-frame gt-view"
            id="showcase-panel"
            role="tabpanel"
            aria-labelledby={`showcase-tab-${active}`}
          >
            <div className="window-bar" aria-hidden="true">
              <i /><i /><i />
              <b>{shots[active].bar}</b>
            </div>
            <div className="gt-stack" ref={trackRef} onScroll={onScroll}>
              {SHOT_IMGS.map((img, i) => (
                <div className="gt-slide" key={img}>
                  {/* A 1280px desktop window rendered at phone width is not
                      readable — tapping opens the screenshot at full size. */}
                  <a className="gt-zoom" href={img} target="_blank" rel="noreferrer" aria-label={shots[i].title}>
                    <img src={img} alt={shots[i].title} loading="eager" draggable={false} />
                  </a>
                </div>
              ))}
            </div>
            <button type="button" className="gt-arrow gt-prev" aria-label={L.shots.prev}
              disabled={active === 0} onClick={() => goTo(active - 1)}>‹</button>
            <button type="button" className="gt-arrow gt-next" aria-label={L.shots.next}
              disabled={active === shots.length - 1} onClick={() => goTo(active + 1)}>›</button>
            <div className="gt-dots" aria-hidden="true">
              {SHOT_IMGS.map((img, i) => (
                <i key={img} className={i === active ? "is-active" : undefined} />
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Security */

const HEX = "0123456789abcdef";

/** A fresh line of fake ciphertext bytes. */
function genCipher(bytes = 26) {
  let out = "";
  for (let i = 0; i < bytes; i++) {
    out += HEX[Math.floor(Math.random() * 16)] + HEX[Math.floor(Math.random() * 16)] + " ";
  }
  return out.trimEnd();
}

/** Live "ciphertext stream" — scrambles a line of hex, honouring reduced motion. */
function CipherStream() {
  const { L } = useI18n();
  const [line, setLine] = useState(() => genCipher());
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setLine(genCipher()), 140);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="cf-cipher" aria-hidden="true">
      <span className="cf-cipher-label">{L.security.cipher}</span>
      <span className="cf-cipher-hex">{line}</span>
    </p>
  );
}

function Security() {
  const { L } = useI18n();
  return (
    <section className="section security-section" id="security">
      <div className="wrap">
        <div className="panel panel-dark">
        <SectionHeading kicker={L.security.kicker} title={L.security.title} lead={L.security.lead} />
        <div className="security-grid">
          {L.security.blocks.map((item, i) => (
            <article className="security-card" key={SECURITY_NAMES[i]}>
              <h3 className="security-name">{SECURITY_NAMES[i]}</h3>
              <p className="security-label">{item.label}</p>
              <p className="security-body">{item.body}</p>
            </article>
          ))}
        </div>
        <div className="crypto-flow" role="img" aria-label={L.security.flowAria}>
          {L.security.flow.map((node, i) => (
            <div className="cf-step" key={node.s}>
              {i > 0 && <span className="cf-arrow" aria-hidden="true" />}
              <div className={`cf-node${i === 0 ? " is-in" : ""}${i === L.security.flow.length - 1 ? " is-out" : ""}`}>
                <small>{node.s}</small>
                <b>{node.b}</b>
              </div>
            </div>
          ))}
        </div>
        <CipherStream />
        <div className="security-note-row">
          <img className="security-art" src="./brand/verify-glass.png" alt="" aria-hidden="true" loading="lazy" />
          <p className="security-note">{L.security.note}</p>
        </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Benchmarks */

const CRACK_LEN = 8;
const SECONDS_PER_YEAR = 3.15576e7;

/** log10(years) and log10(seconds) to brute-force, on average, a random
 *  `length`-char password from a `crackAlphabet`-symbol set at `rate` guesses/s. */
function crackLogs(length: number, rate: number) {
  const logSeconds = length * Math.log10(crackAlphabet) - Math.log10(2) - Math.log10(rate);
  return { logSeconds, logYears: logSeconds - Math.log10(SECONDS_PER_YEAR) };
}

/** Render a humane time figure from its base-10 logs. */
function CrackValue({ logYears, logSeconds }: { logYears: number; logSeconds: number }) {
  const { lang, L } = useI18n();
  const u = L.bench.units;
  if (logYears < 0) {
    const sec = Math.pow(10, logSeconds);
    const [v, unit] =
      sec < 60 ? [sec, u.sec] : sec < 3600 ? [sec / 60, u.min] : sec < 86400 ? [sec / 3600, u.hour] : [sec / 86400, u.day];
    return <><b>{Math.max(1, Math.round(v)).toLocaleString(L.locale)}</b> {unit}</>;
  }
  if (logYears < 5) {
    const y = Math.round(Math.pow(10, logYears));
    return <><b>{y.toLocaleString(L.locale)}</b> {yearWord(lang, L.bench.yearForms, y)}</>;
  }
  const exp = Math.floor(logYears);
  const mant = Math.pow(10, logYears - exp);
  return <><b>{mant.toFixed(1)}·10<sup>{exp}</sup></b> {L.bench.yearForms[2]}</>;
}

/** Interactive "how long to crack" estimate — computed live from stated assumptions. */
function CrackTime() {
  const { L } = useI18n();
  const rows = compareTools.map(t => ({ t, ...crackLogs(CRACK_LEN, crackRatePerSec[t.key]) }));
  const maxLog = Math.max(...rows.map(r => r.logYears), 1);
  return (
    <div className="crack">
      <div className="crack-top">
        <div>
          <h3 className="crack-title">{L.bench.crackTitle}</h3>
          <p className="crack-sub">
            {fmt(L.bench.crackSub, { len: CRACK_LEN, count: crackGpuCount, gpu: crackGpuName })}
          </p>
        </div>
        <span className="crack-scenario" aria-hidden="true">
          <b>{CRACK_LEN}</b> {L.bench.crackChars}
          <i />
          <span className="crack-gpu"><img src="./brand/rtx-4090.png" alt="NVIDIA GeForce RTX 4090" loading="lazy" /></span>
          <b>{crackGpuCount}×</b> RTX 4090
        </span>
      </div>
      <div className="crack-rows">
        {rows.map(({ t, logYears, logSeconds }) => {
          const Logo = compareLogo[t.key];
          const frac = t.open ? 0.02 : logYears > 0 ? Math.max(0.03, Math.min(1, logYears / maxLog)) : 0.03;
          return (
            <div key={t.key} className={`crack-row${t.isAndrii ? " is-andrii" : ""}${t.open ? " is-open" : ""}`}>
              <span className="crack-tool"><Logo size={24} /><b>{t.name}</b></span>
              <span className="crack-bar" aria-hidden="true"><i style={{ width: `${frac * 100}%` }} /></span>
              <span className="crack-val">
                {t.open ? <em className="crack-open">{L.bench.crackOpen}</em>
                  : <CrackValue logYears={logYears} logSeconds={logSeconds} />}
              </span>
            </div>
          );
        })}
      </div>
      <CollapsibleNote id="crack-method" className="crack-foot">
        {L.bench.crackFoot}
      </CollapsibleNote>
    </div>
  );
}

/** Render a comparison cell token as a coloured verdict badge or a tech chip. */
function VsValue({ v, win }: { v: string; win?: boolean }) {
  const { L } = useI18n();
  const verdict = L.bench.verdict;
  if (v === "dash") return <span className="vsb vsb-dash">—</span>;
  if (v.startsWith("t:")) {
    const name = v.slice(2);
    if (win) return <span className="vsb vsb-tech vsb-win"><i>✓</i>{name}</span>;
    return <span className="vsb vsb-tech">{name}</span>;
  }
  if (v.startsWith("yt:")) {
    return <span className="vsb vsb-good"><i>✓</i>{v.slice(3)}</span>;
  }
  switch (v) {
    case "yes": case "always": case "high":
      return <span className="vsb vsb-good"><i>✓</i>{verdict[v]}</span>;
    case "no": case "low":
      return <span className="vsb vsb-bad"><i>✕</i>{verdict[v]}</span>;
    case "partial": case "optional": case "medium":
      return <span className="vsb vsb-mid"><i>~</i>{verdict[v]}</span>;
    default:
      return <span className="vsb vsb-tech">{v}</span>;
  }
}

function Benchmarks() {
  const { L } = useI18n();
  /* On phones the five-tool matrix is unreadable however it is laid out, so
     there it collapses to ANDRII against one rival at a time. The picker is
     mobile-only; the CSS hides the other columns rather than the markup, so
     the full table stays intact for desktop, search engines and print. */
  const [rival, setRival] = useState(1);
  return (
    <section className="section bench-section" id="benchmarks">
      <div className="wrap">
        <div className="panel panel-bench">
        <SectionHeading kicker={L.bench.kicker} title={L.bench.title} lead={L.bench.lead} />
        <div className="bench-stats-row">
          {STATS.map((item, i) => (
            <div
              className={`bench-stat${item.pct === 0 ? " is-zero" : ""}`}
              key={item.value}
              style={{ "--stat": `${item.pct}%` } as CSSProperties}
            >
              <em className="bench-stat-note">{L.bench.statNotes[i]}</em>
              <strong>{item.value}</strong>
              <span>{L.bench.statLabels[i]}</span>
              <i className="bench-stat-bar" aria-hidden="true" />
            </div>
          ))}
        </div>
        <div className="bench-table" role="table">
          <div className="bench-row bench-head" role="row">
            {L.bench.th.map(h => <span key={h}>{h}</span>)}
          </div>
          {benchmarkRows.filter(row => row.savedPct > 0).map(row => (
            <div className="bench-row" role="row" key={row.dataset}>
              <span data-label={L.bench.th[0]}>{row.dataset}</span>
              <span data-label={L.bench.th[1]} className="bench-num">{row.files}</span>
              <span data-label={L.bench.th[2]} className="bench-num">{row.inputMb}</span>
              <span data-label={L.bench.th[3]} className="bench-saved">
                <span className="bar" aria-hidden="true"><b style={{ width: `${Math.min(row.savedPct, 100)}%` }} /></span>
                <i>{row.savedPct.toFixed(1)}%</i>
              </span>
            </div>
          ))}
        </div>

        <h3 className="versus-title">{L.bench.versusTitle}</h3>
        <div className="rival-pick" role="tablist" aria-label={L.bench.versusTitle}>
          {compareTools.slice(1).map((t, i) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={rival === i + 1}
              className={rival === i + 1 ? "is-active" : undefined}
              onClick={() => setRival(i + 1)}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div className="versus-scroll">
        <div className="versus" role="table" data-rival={rival}>
          <div className="versus-head" role="row">
            <span>{L.bench.thParam}</span>
            {compareTools.map(t => {
              const Logo = compareLogo[t.key];
              return (
                <span key={t.key} className={t.isAndrii ? "versus-andrii" : ""}>
                  <span className="vs-tool"><Logo size={26} /><b>{t.name}</b></span>
                </span>
              );
            })}
          </div>
          {comparison.map(row => (
            <div className="versus-row" role="row" key={row.label}>
              <span>{L.bench.compareLabels[row.label]}</span>
              {row.values.map((v, i) => (
                <span
                  key={compareTools[i].key}
                  className={`${i === 0 ? "versus-andrii" : ""}${row.win?.includes(i) ? " vs-win" : ""}`}
                  data-label={compareTools[i].name}
                >
                  <VsValue v={v} win={row.win?.includes(i)} />
                </span>
              ))}
            </div>
          ))}
        </div>
        </div>

        <CrackTime />

        <CollapsibleNote id="bench-caveats" className="bench-caveats">
          <div className="bench-notes">
            {L.bench.caveats.map(item => <p key={item}>{item}</p>)}
          </div>
        </CollapsibleNote>
        <a className="text-link" href={benchmarkDocsUrl} target="_blank" rel="noreferrer">
          {L.bench.report}
        </a>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- FAQ */

function Faq() {
  const { L } = useI18n();
  return (
    <section className="section faq-section" id="faq">
      <div className="wrap">
        <div className="panel faq-wrap">
        <div className="faq-aside">
          <p className="kicker">{L.faq.kicker}</p>
          <h2 className="display">{L.faq.title}</h2>
          <p className="faq-aside-lead">{L.faq.lead}</p>
          <img className="faq-seal" src="./brand/seal-intact.png" alt="" aria-hidden="true" loading="lazy" />
        </div>
        <div className="faq-list">
          {L.faq.items.map((item, index) => (
            <details key={item.q} open={index === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Download */

function Download() {
  const { L } = useI18n();
  return (
    <section className="section cta-section" id="download">
      <div className="wrap">
        <div className="cta-panel">
          <div className="cta-grid">
            <div className="cta-copy">
              <p className="kicker">{L.dl.kicker}</p>
              <h2 className="display">{L.dl.title}</h2>
              <p className="cta-lead">{downloadsLive ? L.dl.lead : L.dl.draftLead}</p>
              <div className="hero-actions cta-actions">
                <DownloadCta variant="windows" />
                <DownloadCta variant="linux" />
              </div>
              {/* While the release is a draft the download buttons are inert,
                  so give the visitor something that actually works today. */}
              {!downloadsLive && (
                <div className="cta-alt">
                  <a className="btn btn-secondary btn-sm" href={release.repoUrl} target="_blank" rel="noreferrer">
                    <IconGithub size={15} /> {L.dl.buildCta}
                  </a>
                  <a className="text-link cta-alt-link" href={release.releasesUrl} target="_blank" rel="noreferrer">
                    {L.dl.repoCta} →
                  </a>
                </div>
              )}
              <ul className="cta-free" aria-label="Terms">
                {L.dl.freeLine.map(x => <li key={x}>{x}</li>)}
              </ul>
            </div>
            <aside className="release-card">
              <div className="rc-row"><span>{L.dl.card.version}</span><b>{release.version}</b></div>
              <div className="rc-row"><span>{L.dl.card.channel}</span><b>{L.dl.card.channelValue}</b></div>
              <div className="rc-row"><span>{L.dl.card.platforms}</span><b>{L.dl.card.platformsValue}</b></div>
              <div className="rc-row"><span>{L.dl.card.license}</span><b>{L.dl.card.licenseValue}</b></div>
              <a className="rc-link" href={release.repoUrl} target="_blank" rel="noreferrer">
                <IconGithub size={16} /> {L.dl.card.github}
              </a>
            </aside>
          </div>
          <div className="download-grid">
            <DownloadPlatform title={L.dl.winTitle} note={L.dl.winNote} assets={release.assets.windows} />
            <DownloadPlatform title={L.dl.linuxTitle} note={L.dl.linuxNote} assets={release.assets.linux} />
          </div>
          <p className="checksums-note">
            {L.dl.checksumsNote}{" "}
            <a href={checksumsUrl()} target="_blank" rel="noreferrer">
              {L.dl.checksums} ({release.checksumsFile}) →
            </a>
          </p>
          {!downloadsLive && (
            <p className="release-note">{L.draftStatus}. {L.dl.releaseNote}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function DownloadCta({ variant }: { variant: "windows" | "linux" }) {
  const { L } = useI18n();
  const isWin = variant === "windows";
  const label = isWin ? L.hero.winBtn : L.hero.linuxBtn;
  const note = isWin ? fmt(L.hero.winNote, { v: release.version }) : L.hero.linuxNote;
  const Glyph = isWin ? IconWindowsGlyph : IconTuxGlyph;
  const className = `btn btn-big ${isWin ? "btn-primary" : "btn-secondary"}`;
  const inner = (
    <>
      <span className="btn-glyph" aria-hidden="true"><Glyph size={28} /></span>
      <span className="btn-stack"><strong>{label}</strong><small>{note}</small></span>
    </>
  );
  if (downloadsLive) {
    // Link straight at the artifact — the primary CTA should download, not
    // scroll to a section that repeats the same buttons.
    const asset = isWin ? release.assets.windows[0] : release.assets.linux[0];
    return (
      <a className={className} href={assetUrl(asset)} download>
        {inner}
      </a>
    );
  }
  return <button className={className} disabled title={L.draftStatus}>{inner}</button>;
}

function DownloadPlatform({ title, note, assets }: { title: string; note: string; assets: readonly PlatformAsset[] }) {
  const { L } = useI18n();
  const Glyph = title === "Windows" ? IconWindowsGlyph : IconTuxGlyph;
  return (
    <article className="download-card">
      <div className="download-title">
        <span aria-hidden="true"><Glyph size={20} /></span>
        <div><h3>{title}</h3><p>{note}</p></div>
      </div>
      {assets.map(asset => (
        <div className="download-file" key={asset.filename}>
          <div className="df-meta">
            <strong>
              {L.dl.assets[asset.kind]}
              <em className="df-size">{asset.size}</em>
            </strong>
            <span>{asset.filename}</span>
            {/* The real digest of the artifact on GitHub — a security tool
                should let you verify what you downloaded. */}
            <code className="df-hash" title={asset.sha256}>
              {L.dl.verifyLabel} {asset.sha256.slice(0, 16)}…
            </code>
          </div>
          {downloadsLive
            ? <a className="btn btn-secondary btn-sm" href={assetUrl(asset)} download>{L.dl.get}</a>
            : <span className="soon-badge" title={L.draftStatus}>{L.dl.soon}</span>}
        </div>
      ))}
    </article>
  );
}

/* ------------------------------------------------------------------ Footer */

function Footer() {
  const { L } = useI18n();
  return (
    <footer className="site-footer">
      <div className="wrap footer-wrap">
        <div className="footer-brand">
          <img src="./brand/andrii-logo.png" alt="ANDRII" />
          <p className="footer-copy">© {site.copyrightYear} {site.name} Project.<br />{L.footer.tagline}</p>
        </div>
        <nav className="footer-links">
          <a href={benchmarkDocsUrl} target="_blank" rel="noreferrer">{L.footer.links[0]}</a>
          <a href={release.repoUrl} target="_blank" rel="noreferrer">{L.footer.links[1]}</a>
          <a href="#security">{L.footer.links[2]}</a>
          <a href={release.repoUrl} target="_blank" rel="noreferrer">{L.footer.links[3]}</a>
        </nav>
        <div className="footer-social">
          <IconWindowsGlyph size={18} />
          <IconTuxGlyph size={18} />
          <a href={release.repoUrl} target="_blank" rel="noreferrer" aria-label="GitHub"><IconGithub size={18} /></a>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------- Shared bits */

/**
 * Long methodology text. Full-height on desktop; on phones the CSS clamps it to
 * a few lines behind a fade, and this checkbox expands it — no JS, and it stays
 * fully in the DOM for search engines and screen readers.
 */
function CollapsibleNote({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  const { L } = useI18n();
  return (
    <div className={`note-collapse${className ? ` ${className}` : ""}`}>
      <input type="checkbox" id={id} />
      <div className="note-body">{children}</div>
      <label className="note-toggle" htmlFor={id}>
        <span className="note-toggle-more">{L.more}</span>
        <span className="note-toggle-less">{L.less}</span>
      </label>
    </div>
  );
}

function SectionHeading({ kicker, title, lead }: { kicker?: string; title: string; lead?: string }) {
  return (
    <div className="section-heading">
      <div>
        {kicker && <p className="kicker">{kicker}</p>}
        <h2 className="display">{title}</h2>
      </div>
      {lead && <p className="section-lead">{lead}</p>}
    </div>
  );
}
