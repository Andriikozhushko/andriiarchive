import { IconLock, IconShield } from "../components/Icons";

const CRYPTO = [
  {
    name: "Argon2id",
    light: "key derivation",
    title: "A key derived from your password",
    body: "Argon2id — the Password Hashing Competition winner — derives the encryption key from your password and is memory-hard, making offline guessing attacks far more costly. Default parameters: 64 MiB, 3 passes, 4 lanes.",
  },
  {
    name: "XChaCha20-Poly1305",
    light: "authenticated encryption",
    title: "Encrypts data, detects tampering",
    body: "Every chunk of file content is encrypted and authenticated. The extended 192-bit nonce makes random-nonce generation safe and eliminates a whole class of nonce-reuse bugs. Modification is detected on decrypt.",
  },
  {
    name: "BLAKE3",
    light: "integrity hashing",
    title: "Verifies every file, byte-for-byte",
    body: "A BLAKE3 hash is stored for each file and tied to its content through authenticated data, then re-checked after decryption. A whole-archive BLAKE3 footer hash also guards against truncation.",
  },
];

export default function Security() {
  return (
    <section className="section" id="security">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Security model</span>
          <h2 className="section-title">Modern primitives, honestly described.</h2>
          <p className="section-lead">
            ANDRII combines three well-known, widely reviewed cryptographic building blocks.
            Names, structure and metadata are encrypted; processing is local-only.
          </p>
        </div>

        <div className="crypto-row">
          {CRYPTO.map(c => (
            <div className="crypto" key={c.name}>
              <div className="name">{c.name} <span className="light">· {c.light}</span></div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>

        <div className="security-panels">
          <div className="panel" style={{ padding: 24 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.1rem" }}>
              <IconLock style={{ color: "var(--accent-deep)" }} /> What is protected
            </h3>
            <ul style={{ marginTop: 14, paddingLeft: 20, color: "var(--ink-soft)", lineHeight: 1.9 }}>
              <li>File contents — encrypted chunk by chunk</li>
              <li>File names and directory structure — encrypted in the header</li>
              <li>Sizes, timestamps and metadata — encrypted</li>
              <li>The whole archive — BLAKE3 footer hash guards against truncation</li>
            </ul>
          </div>
          <div className="panel" style={{ padding: 24, display: "flex", gap: 18, alignItems: "center" }}>
            <span style={{ flexShrink: 0 }}><img src="./brand/verify-glass.png" alt="" style={{ width: 120 }} /></span>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.1rem" }}>
                <IconShield style={{ color: "var(--accent-deep)" }} /> Verify before you trust
              </h3>
              <p style={{ marginTop: 10, color: "var(--ink-soft)", fontSize: "0.95rem" }}>
                Run a verification on any .andrii archive to confirm the seal is still intact.
                A modified archive is reported as broken — do not trust it.
              </p>
            </div>
          </div>
        </div>

        <div className="security-limits">
          <span className="li"><img src="./brand/seal-broken.png" alt="" style={{ width: 40, flexShrink: 0 }} /></span>
          <p>
            <strong>Security limits.</strong> Forgotten passwords cannot be recovered — there is
            no backdoor. The ANDRII implementation has <strong>not</strong> had an independent
            cryptographic audit (the underlying primitives are widely reviewed). Keep backups of
            important archives, and use a strong password.
          </p>
        </div>
      </div>
    </section>
  );
}
