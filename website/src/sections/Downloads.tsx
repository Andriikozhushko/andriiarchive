import { release, downloadsLive } from "../config/release";
import DownloadButton from "../components/DownloadButton";
import { IconAlert, IconArrow } from "../components/Icons";

const OS_ICON = {
  exe: "⊞",
  msi: "⊞",
  appimage: "🐧",
  deb: "🐧",
};

export default function Downloads() {
  return (
    <section className="section" id="download" style={{ background: "rgba(239,231,212,0.5)" }}>
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow" style={{ justifyContent: "center" }}>Cross-platform availability</span>
          <h2 className="section-title">Get ANDRII for your desktop</h2>
          <p className="section-lead">
            Windows and Linux, both x64. {downloadsLive
              ? `Installers are available from GitHub Releases for v${release.version}.`
              : "Installers will be available from GitHub Releases once the release candidate is published."}
          </p>
        </div>

        <div className="platforms">
          <div className="platform">
            <h3>Windows</h3>
            <p className="os-note">Windows 10/11, x64 · WebView2 runtime</p>
            {release.assets.windows.map(a => (
              <div className="asset" key={a.filename}>
                <span aria-hidden style={{ fontSize: "1.4rem", color: "var(--accent-deep)" }}>{OS_ICON[a.kind]}</span>
                <div className="meta">
                  <div className="label">{a.label}</div>
                  <div className="note">{a.filename}</div>
                </div>
                <DownloadButton asset={a} />
              </div>
            ))}
          </div>

          <div className="platform">
            <h3>Linux</h3>
            <p className="os-note">x64 · AppImage is portable; DEB needs WebKitGTK 4.1</p>
            {release.assets.linux.map(a => (
              <div className="asset" key={a.filename}>
                <span aria-hidden style={{ fontSize: "1.4rem", color: "var(--accent-deep)" }}>{OS_ICON[a.kind]}</span>
                <div className="meta">
                  <div className="label">{a.label}</div>
                  <div className="note">{a.filename}</div>
                </div>
                <DownloadButton asset={a} />
              </div>
            ))}
          </div>
        </div>

        {!downloadsLive && (
          <div className="draft-banner">
            <span className="li"><IconAlert /></span>
            <div>
              <strong>{release.draftStatus}.</strong> The release is currently an unpublished draft —
              download buttons are intentionally disabled so no private/draft asset is exposed. Once the
              release is published, set <code className="mono">releaseState</code> to{" "}
              <code className="mono">"published"</code> in{" "}
              <code className="mono">src/config/release.ts</code> to activate public links.{" "}
              <a href={release.repoUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
                View the repository <IconArrow />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
