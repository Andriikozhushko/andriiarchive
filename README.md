<div align="center">

# ANDRII

**Encrypted archives. Local by design.**

Seal files into a single password-protected `.andrii` archive.
Contents, file names and folder structure are all encrypted — nothing leaves your machine.

[![Release](https://img.shields.io/badge/release-v1.0.0-b4490d)](https://github.com/Andriikozhushko/andriiarchive/releases)
[![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20Linux-1b1712)](#installation)
[![License](https://img.shields.io/badge/license-MIT-1b1712)](LICENSE)

</div>

---

## What it does

ANDRII is a desktop app that packs files into one encrypted container. It is **not** a general-purpose
archiver: it exists for the files you would not want anyone else to read.

- **Everything is hidden, including names.** File names, folder structure, sizes and timestamps are
  encrypted along with the contents. From the outside only the container's size is visible.
- **No cloud, no accounts, no telemetry.** Encryption, compression and verification all run locally.
  The app makes no network requests.
- **No backdoor and no recovery.** The key is derived from your password alone. Lose it and the
  archive is gone — that is a property of the design, not an oversight.
- **Verifiable.** The format is documented and the source is open, including reproducible benchmarks.

## Cryptography

| Purpose | Primitive | Notes |
| --- | --- | --- |
| Key derivation | **Argon2id** | 64 MiB, 3 passes, 4 lanes — memory-hard, so GPU guessing is expensive |
| Encryption | **XChaCha20-Poly1305** | AEAD; every chunk is authenticated, 192-bit nonces |
| Integrity | **BLAKE3** | Per-file hashes plus a whole-archive hash in the footer |
| Compression | **Zstandard** | Applied *before* encryption, so the ciphertext stays indistinguishable |

Each file (or solid group) gets a random 128-bit base nonce combined with a big-endian chunk counter,
so nonces are never reused. The chunk index and a last-chunk flag are authenticated as associated
data, which binds chunk **ordering and count** — reordering or truncating a stream is detected.

Honest limitations, stated up front: the implementation has **not** had an independent cryptographic
audit; `verify` without a password detects corruption, not deliberate tampering (see
[docs/SECURITY.md](docs/SECURITY.md)); and real-world strength is bounded by your password.

## Installation

Prebuilt installers are published on the [Releases page](https://github.com/Andriikozhushko/andriiarchive/releases).

| Platform | Artifact | Requirements |
| --- | --- | --- |
| Windows 10/11 (x64) | `.exe` installer or `.msi` | WebView2 Runtime (preinstalled on Windows 11) |
| Linux (x64) | `.AppImage` (portable) or `.deb` | AppImage: none · DEB: WebKitGTK 4.1 |

## Building from source

Prerequisites: [Rust](https://rustup.rs) (stable), [Node.js](https://nodejs.org) 18+, and the
[Tauri v2 system dependencies](https://v2.tauri.app/start/prerequisites/) for your platform.

```bash
git clone https://github.com/Andriikozhushko/andriiarchive.git
cd andriiarchive
npm install
npm run tauri dev      # run the app
npm run tauri build    # produce installers in src-tauri/target/release/bundle
```

## Repository layout

```
crates/
  andrii-crypto/     Argon2id, XChaCha20-Poly1305, BLAKE3 — no I/O, no app logic
  andrii-compress/   Zstd wrapper with bounded decompression
  andrii-core/       The .andrii container: writer, reader, verifier, format types
src-tauri/           Tauri v2 backend — command handlers, capabilities, packaging
src/                 React + TypeScript UI (7 languages)
website/             The public marketing site (independent Vite build)
docs/                Format spec, security notes, release process, benchmarks
```

## Testing

```bash
cargo test --workspace --exclude andrii-app   # Rust: 101 tests
npx tsc --noEmit                              # frontend type check
```

`andrii-app` is excluded because its test binary cannot start outside a WebView2 host on Windows;
it contains no tests of its own. CI runs the same command.

Security-critical behaviour has dedicated regression tests in
[`crates/andrii-core/tests/security.rs`](crates/andrii-core/tests/security.rs). These build genuinely
hostile archives — for example one whose stored entry path is `../ev.txt`, re-sealed so the reader
authenticates it — and assert that extraction refuses them and writes nothing outside the target
directory.

## Benchmarks

Reproducible measurements live in [docs/BENCHMARK_REPORT.md](docs/BENCHMARK_REPORT.md). The summary
is deliberately unflattering where it should be: text and source code compress well (≈80% saved on
small text), already-compressed media does not shrink at all, and the app says so before sealing
rather than after.

```bash
node scripts/benchmark-andrii.mjs
```

## Security

Found a vulnerability? Please report it privately rather than opening a public issue — see
[docs/SECURITY.md](docs/SECURITY.md) for the disclosure process and for the current threat model,
including what ANDRII deliberately does not defend against.

## License

MIT — see [LICENSE](LICENSE).
