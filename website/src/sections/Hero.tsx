import { release, downloadsLive } from "../config/release";
import { site } from "../config/site";
import { IconArrow, IconCheck } from "../components/Icons";
import { PaperBundle } from "../components/Art";
import Shot from "../components/Shot";

export default function Hero() {
  const primaryLabel = downloadsLive ? "Get ANDRII" : "View release status";
  const statusLine = downloadsLive
    ? `ANDRII v${release.version} is available for Windows and Linux.`
    : release.draftStatus;

  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <span className="chip" style={{ marginBottom: 22 }}>
              <IconCheck /> Local-first · No cloud · No telemetry
            </span>

            <h1>
              Encrypted archives.
              <br />
              <span className="accent">Local by design.</span>
            </h1>

            <p className="hero-lead">{site.shortDescription}</p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="#download">
                {primaryLabel} <IconArrow />
              </a>
              <a className="btn btn-secondary" href="#security">
                Explore security model
              </a>
            </div>

            <div className="hero-trust">
              <span><IconCheck /> XChaCha20-Poly1305</span>
              <span><IconCheck /> Argon2id</span>
              <span><IconCheck /> BLAKE3</span>
              <span><IconCheck /> Open source</span>
            </div>

            <p className="muted" style={{ marginTop: 24, fontSize: "0.9rem" }}>
              {statusLine}
            </p>
          </div>

          <div className="hero-visual">
            <img src="./brand/seal-intact.png" alt="" className="hero-decor seal-1" style={{ width: 94 }} />
            <PaperBundle size={96} className="hero-decor bundle" />
            <div className="hero-shot">
              <Shot
                src="./screenshots/home.webp"
                alt="ANDRII desktop app — main vault home screen"
                width={1280}
                height={819}
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
