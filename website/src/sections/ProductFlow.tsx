import Shot from "../components/Shot";

const STEPS = [
  {
    num: "01",
    title: "Add files",
    body: "Drag files or folders onto the vault, or pick them with the file browser.",
    shot: "create-files.webp",
    alt: "ANDRII create-archive screen with selected files listed",
    w: 1280, h: 819,
  },
  {
    num: "02",
    title: "Choose a password",
    body: "Name the archive and set the key. Live strength feedback helps you pick a strong one.",
    shot: "create-files.webp",
    alt: "ANDRII archive configuration with password strength meter",
    w: 1280, h: 819,
  },
  {
    num: "03",
    title: "Seal the archive",
    body: "ANDRII streams your files through encryption and compression, with real progress.",
    shot: "progress.webp",
    alt: "ANDRII sealing progress bar",
    w: 1280, h: 819,
  },
  {
    num: "04",
    title: "Open or verify later",
    body: "Unlock to browse and extract, or run a verification to confirm the seal is intact.",
    shot: "sealed.webp",
    alt: "ANDRII sealed-archive result screen",
    w: 1280, h: 819,
  },
];

export default function ProductFlow() {
  return (
    <section className="section" id="flow" style={{ background: "rgba(239,231,212,0.5)" }}>
      <div className="wrap">
        <div className="section-head center">
          <img src="./brand/chest-open.png" alt="" style={{ width: 76, display: "block", margin: "0 auto 14px" }} />
          <span className="eyebrow" style={{ justifyContent: "center" }}>How it works</span>
          <h2 className="section-title">Four steps from files to a sealed vault</h2>
          <p className="section-lead">The same vault object appears on every screen — only its state changes.</p>
        </div>

        <div className="steps">
          {STEPS.map(s => (
            <div className="step" key={s.num}>
              <div className="step-card">
                <div className="step-num">STEP {s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <div className="step-shot">
                  <Shot src={`./screenshots/${s.shot}`} alt={s.alt} width={s.w} height={s.h} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
