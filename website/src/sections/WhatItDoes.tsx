import { InkAddFiles, InkFolder, InkStamp, InkLens, InkKey, ArchiveBox } from "../components/Art";

const FEATURES = [
  {
    ico: <InkAddFiles size={30} />,
    title: "Seal files into one archive",
    body: "Drop in files or whole folders. ANDRII packs them into a single password-protected .andrii archive, preserving your folder structure.",
  },
  {
    ico: <InkKey size={30} />,
    title: "One password, no recovery",
    body: "A single password derives every key with Argon2id. There is no backdoor and no recovery — the password is the only way in.",
  },
  {
    ico: <InkStamp size={30} />,
    title: "Names & metadata encrypted",
    body: "File names, sizes, timestamps and directory structure are all encrypted. The archive reveals nothing about what it holds.",
  },
  {
    ico: <InkLens size={30} />,
    title: "Verify it wasn't touched",
    body: "Check any .andrii archive later. BLAKE3 integrity tells you immediately whether the seal is intact or has been modified.",
  },
  {
    ico: <InkFolder size={30} />,
    title: "Open & extract locally",
    body: "Unlock an archive with the password and browse its contents. Extract everything or just the files you select — all on your machine.",
  },
  {
    ico: <ArchiveBox size={46} variant="sealed" />,
    title: "Streaming, bounded memory",
    body: "Archives are created and read in a streaming pass, so peak memory stays small regardless of how large the archive is.",
  },
];

export default function WhatItDoes() {
  return (
    <section className="section" id="what">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">What ANDRII does</span>
          <h2 className="section-title">A private box for your files — sealed, not uploaded.</h2>
          <p className="section-lead">
            ANDRII turns a set of files into one self-contained, encrypted archive you control.
            Everything happens on your computer; nothing leaves it.
          </p>
        </div>

        <div className="grid grid-3">
          {FEATURES.map(f => (
            <div className="feature" key={f.title}>
              <div className="ico">{f.ico}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
