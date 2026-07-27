import Shot from "../components/Shot";

const SHOTS = [
  { src: "home.webp", title: "Main vault", caption: "The home screen — drop files to create a sealed archive.", w: 1280, h: 819 },
  { src: "create-files.webp", title: "Create — files added", caption: "Selected files gathered in the vault, ready to seal.", w: 1280, h: 819 },
  { src: "progress.webp", title: "Sealing — progress", caption: "Real streaming progress with files, bytes and ETA.", w: 1280, h: 819 },
  { src: "sealed.webp", title: "Archive sealed", caption: "The result: one encrypted box only the password can open.", w: 1280, h: 819 },
  { src: "open.webp", title: "Open an archive", caption: "Unlock with the password, then browse and extract.", w: 1280, h: 819 },
  { src: "verify-intact.webp", title: "Verify — intact", caption: "BLAKE3 confirms the seal has not been touched.", w: 1280, h: 819 },
  { src: "verify-tampered.webp", title: "Verify — broken", caption: "A modified archive is reported as a broken seal.", w: 1280, h: 819 },
  { src: "settings.webp", title: "Settings", caption: "Seven languages, password generator and about.", w: 1280, h: 819 },
];

export default function Gallery() {
  return (
    <section className="section" id="screenshots">
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow" style={{ justifyContent: "center" }}>Real screenshots</span>
          <h2 className="section-title">The actual desktop application</h2>
          <p className="section-lead">
            These are real captures of the ANDRII desktop app — not mockups. The same hand-drawn
            vault object appears across every screen.
          </p>
        </div>

        <div className="gallery">
          {SHOTS.map(s => (
            <figure className="shot" key={s.src}>
              <Shot src={`./screenshots/${s.src}`} alt={`ANDRII app — ${s.title}`} width={s.w} height={s.h} />
              <figcaption>
                <strong>{s.title}.</strong> {s.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
