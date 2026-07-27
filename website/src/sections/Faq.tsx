import { faq } from "../data/faq";

export default function Faq() {
  return (
    <section className="section" id="faq" style={{ background: "rgba(239,231,212,0.5)" }}>
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow" style={{ justifyContent: "center" }}>FAQ</span>
          <h2 className="section-title">Questions, answered honestly</h2>
        </div>

        <div className="faq-list">
          {faq.map((item, i) => (
            <details className="faq-item" key={i} open={i === 0}>
              <summary>
                <span>{item.q}</span>
                <span className="toggle" aria-hidden="true">+</span>
              </summary>
              <div className="faq-answer">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
