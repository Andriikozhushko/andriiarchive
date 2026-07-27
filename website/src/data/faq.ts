export interface FaqItem {
  q: string;
  a: string;
}

export const faq: FaqItem[] = [
  {
    q: "Is ANDRII a replacement for ZIP or 7-Zip?",
    a: "It is a different tool with a different priority. ZIP and 7-Zip are general-purpose archivers; ANDRII is focused on sealing files into a single password-protected, encrypted archive where the filenames and metadata are also protected. Use ANDRII when you want a private, self-contained encrypted box — not when you need every compression format under the sun.",
  },
  {
    q: "Why do videos and archives often not shrink much?",
    a: "Because they are already compressed. Video, photos, audio and existing archives (.zip, .7z, .mp4, .jpg, …) have little redundant data left, so further compression yields little or nothing. ANDRII detects this and skips wasted CPU rather than pretending to shrink them. Text, source code and many small files compress well.",
  },
  {
    q: "Can a forgotten password be recovered?",
    a: "No. There is no recovery mechanism and no backdoor. The key is derived from your password with Argon2id; without the password the contents cannot be decrypted. Keep your password safe and keep backups of important archives.",
  },
  {
    q: "Are filenames protected?",
    a: "Yes. File names, directory structure, sizes and metadata are all encrypted inside the archive. Someone who only has the .andrii file cannot see what is inside it or what it is called.",
  },
  {
    q: "Does ANDRII upload files anywhere?",
    a: "No. ANDRII is local-first. All encryption, compression and verification happen on your own machine. There is no cloud processing and no telemetry — the app never sends your files or metadata anywhere.",
  },
  {
    q: "Is the application open source?",
    a: "Yes. ANDRII is licensed under the MIT license and the source is on GitHub, including the archive format specification and the reproducible benchmark suite.",
  },
  {
    q: "Which operating systems are supported?",
    a: "Windows (NSIS Setup .exe and MSI) and Linux (AppImage and DEB), both x64. macOS, ARM and 32-bit builds are out of scope for this release candidate.",
  },
  {
    q: "Has the encryption been independently audited?",
    a: "No. ANDRII uses well-known, widely reviewed cryptographic primitives (XChaCha20-Poly1305, Argon2id, BLAKE3), but the ANDRII implementation itself has not had an independent security audit. Treat it accordingly and keep backups.",
  },
];
