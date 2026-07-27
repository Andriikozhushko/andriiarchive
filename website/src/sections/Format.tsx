const VERSIONS = [
  {
    ver: "v1",
    title: "The baseline",
    body: "The original encrypted archive layout. All content and metadata encrypted with a single password-derived key.",
    points: ["Per-file encrypted blocks", "Authenticated header", "BLAKE3 footer"],
    compatible: false,
  },
  {
    ver: "v2",
    title: "Random-access mode",
    body: "Chunked streaming with bounded memory, and per-file layout so a single file can be extracted without reading the whole archive. Fast and Balanced always write v2.",
    points: ["Streaming, bounded RAM", "Instant single-file extract", "Reader opens v1/v2/v3"],
    compatible: false,
  },
  {
    ver: "v3",
    title: "Maximum — solid groups",
    body: "Maximum mode bundles compressible, small-enough files into bounded ≤16 MiB solid groups compressed with a shared dictionary — materially smaller for text-heavy and many-small-file archives. Per-file encryption and BLAKE3 integrity are preserved.",
    points: ["Solid-group compression", "Shared cross-file dictionary", "Falls back to per-file for media"],
    compatible: false,
  },
];

export default function Format() {
  return (
    <section className="section" id="format" style={{ background: "rgba(239,231,212,0.5)" }}>
      <div className="wrap">
        <div className="section-head">
          <img src="./brand/archive-box.png" alt="" style={{ width: 64, display: "block", margin: "0 0 16px" }} />
          <span className="eyebrow">Format architecture</span>
          <h2 className="section-title">One .andrii format, three reader-compatible versions.</h2>
          <p className="section-lead">
            The writer chooses the layout for the job: Fast and Balanced use the v2 per-file
            layout; Maximum uses v3 solid groups. The reader opens v1, v2 and v3 — older archives
            keep working.
          </p>
        </div>

        <div className="format-grid">
          {VERSIONS.map(v => (
            <div className={`fmt ${v.compatible ? "compatible" : ""}`} key={v.ver}>
              <span className="ver">{v.ver}</span>
              <h3>{v.title}</h3>
              <p>{v.body}</p>
              <ul>
                {v.points.map(p => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="fmt compatible" style={{ marginTop: 22, display: "flex", gap: 16, alignItems: "center", maxWidth: 760 }}>
          <span className="ver">reader</span>
          <p style={{ margin: 0, minWidth: 0 }}>
            <strong>Backward-compatible readers.</strong> Not every archive uses v3 — only Maximum
            mode does. Any ANDRII reader opens v1, v2 and v3 archives, so existing archives remain
            accessible as the format evolves.
          </p>
        </div>
      </div>
    </section>
  );
}
