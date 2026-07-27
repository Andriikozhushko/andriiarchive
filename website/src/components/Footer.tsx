import { release, downloadsLive } from "../config/release";
import { site } from "../config/site";
import { IconGithub } from "./Icons";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="./brand/andrii-logo.png" alt="ANDRII" />
            <p>{site.shortDescription}</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href={release.repoUrl}>GitHub</a>
            <a href={release.releasesUrl}>Releases</a>
            <a href="#security">Security</a>
            <a href="#format">Format spec</a>
            <a href="#faq">FAQ</a>
          </nav>
        </div>

        <div className="footer-bottom">
          <div>
            <p>
              ANDRII v{release.version} ·{" "}
              {downloadsLive ? "Released" : "Release candidate"} · {site.license} license
            </p>
            <p className="disclaimer" style={{ marginTop: 8 }}>
              ANDRII uses well-known cryptographic primitives (XChaCha20-Poly1305, Argon2id,
              BLAKE3), but the implementation has <strong>not</strong> had an independent
              security audit. Keep backups of important archives. Forgotten passwords cannot
              be recovered.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <a
              href={release.repoUrl}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ink-soft)" }}
            >
              <IconGithub /> Source on GitHub
            </a>
            <p style={{ marginTop: 8 }}>© {site.copyrightYear} {site.author}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
