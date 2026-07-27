import { benchmarkRows, solidGains, benchmarkClaims, benchmarkCaveats, benchmarkDocsUrl } from "../data/benchmarks";
import { IconCheck, IconAlert, IconArrow } from "../components/Icons";

export default function Benchmarks() {
  return (
    <section className="section" id="benchmarks">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Benchmarks</span>
          <h2 className="section-title">Honest compression numbers, reproducibly measured.</h2>
          <p className="section-lead">
            Every figure below comes from the repository's reproducible benchmark suite. We report
            what actually happens — including the cases where compression does almost nothing.
          </p>
        </div>

        <div className="bench-table-wrap">
          <table className="bench">
            <thead>
              <tr>
                <th>Dataset</th>
                <th className="num">Files</th>
                <th className="num">Input</th>
                <th>Mode</th>
                <th className="num">Saved</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkRows.map(r => (
                <tr key={r.dataset}>
                  <td>{r.dataset}</td>
                  <td className="num mono">{r.files.toLocaleString()}</td>
                  <td className="num mono">{r.inputMb}</td>
                  <td className="mono">{r.mode}</td>
                  <td className="num">
                    {r.savedPct > 0 ? (
                      <span className="saved-bar">
                        <span className="saved-track"><span className="saved-fill" style={{ width: `${Math.min(100, r.savedPct)}%` }} /></span>
                        {r.savedPct.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="saved-zero mono">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bench-cols">
          <div className="panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 14 }}>v3 Maximum — solid groups vs v2 per-file</h3>
            <p className="muted" style={{ fontSize: "0.9rem", marginBottom: 14 }}>
              Same files, two layouts. Largest gains on many-small-file and text workloads; ~zero
              on already-compressed media, where v3 correctly falls back to per-file storage.
            </p>
            <div className="bench-table-wrap" style={{ border: "1px solid var(--border)" }}>
              <table className="bench" style={{ minWidth: 0 }}>
                <thead>
                  <tr>
                    <th>Dataset</th>
                    <th className="num">v2</th>
                    <th className="num">v3</th>
                    <th className="num">Smaller</th>
                  </tr>
                </thead>
                <tbody>
                  {solidGains.map(g => (
                    <tr key={g.dataset}>
                      <td>{g.dataset}</td>
                      <td className="num mono">{g.v2}</td>
                      <td className="num mono">{g.v3}</td>
                      <td className="num mono">{g.smallerPct > 0 ? `${g.smallerPct.toFixed(1)}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <ul className="bench-claims" style={{ paddingLeft: 20, listStyle: "disc" }}>
              {benchmarkClaims.map(c => <li key={c}><IconCheck style={{ color: "var(--safe-deep)", width: 14, height: 14, verticalAlign: "-2px", marginRight: 4 }} />{c}</li>)}
            </ul>
            <ul className="bench-claims caveats" style={{ paddingLeft: 20, listStyle: "disc", marginTop: 18 }}>
              {benchmarkCaveats.map(c => <li key={c}><IconAlert style={{ color: "var(--amber)", width: 14, height: 14, verticalAlign: "-2px", marginRight: 4 }} />{c}</li>)}
            </ul>
          </div>
        </div>

        <p style={{ marginTop: 28, fontSize: "0.92rem" }}>
          <a href={benchmarkDocsUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            Read the full benchmark methodology &amp; report <IconArrow />
          </a>
        </p>
      </div>
    </section>
  );
}
