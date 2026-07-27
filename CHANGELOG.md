# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- **Path traversal on extraction (critical).** Entry paths stored inside an archive were joined onto
  the output directory without validation, so a crafted `.andrii` shared with its password could
  write files anywhere the user could — including startup folders — leading to code execution. All
  three extraction paths now resolve through `format::path::safe_join`, which rejects `..`
  components, absolute and drive-prefixed paths, NTFS alternate data streams, reserved device names
  and control characters. Rejection happens before any I/O. Checks are host-independent, so
  `..\evil` is refused on Linux too.
- **Process abort on a malformed archive.** The encrypted-header length is read from the
  unauthenticated fixed header and drove an allocation directly; a corrupt value such as 2^40 made
  the allocation fail and aborted the process — a crash no caller could catch. The length is now
  bounded by both the file size and a 256 MiB ceiling, and is validated *before* key derivation so
  damaged files fail instantly instead of after a second of Argon2. Sealed-chunk length prefixes and
  the v1 block size are bounded the same way.
- **Zstd decompression bombs.** `decompress` ignored its size hint (it was only applied as a
  post-hoc `shrink_to`), so a small sealed chunk could inflate to tens of gigabytes and exhaust
  memory or fill the disk. The expected size is now a hard limit enforced *during* inflation.
- **Passwords are zeroized in the Tauri layer.** Command request structs held `password: String`,
  which was dropped without wiping and could linger in swap or a crash dump. They now use
  `Zeroizing<String>`, and `Debug` was removed so a stray `{:?}` cannot print a secret.
- **Filesystem capability narrowed.** The app granted itself `fs:read-all` + `fs:write-all` (whole
  disk) for what is a single `stat` call; reduced to `fs:allow-stat`.
- **CSP hardened.** `'unsafe-inline'` removed from `script-src` (the built bundle emits no inline
  scripts). `style-src` is unchanged, as React inline styles require it.

### Fixed

- **Files that could never be extracted.** In Maximum (v3 solid) mode the per-file entry recorded the
  size measured during scanning while hashing the bytes actually read. A file that changed size
  between the two — a log being appended to, a document saved by an editor — was sealed "successfully"
  but sliced at the wrong length on extraction, failing its integrity check forever. The size read is
  now the size stored.
- **Durability on power loss.** The archive is now `sync_all`'d before the atomic rename, so a power
  cut just after sealing cannot leave a durable filename pointing at unwritten data.
- **Double-Enter started two seals of the same archive.** The in-flight flag was set only after the
  native save dialog returned, so two quick triggers both passed the guard and could write the same
  `.andrii` file concurrently, corrupting it. Guarded synchronously with a ref, released on every
  exit path. The same pre-dialog race in extract and unlock is fixed too.
- **Navigating away mid-operation orphaned it.** Sealing or extracting now locks the title-bar
  navigation, so a running operation can no longer lose its progress UI and later yank the user out
  of an unrelated screen when it finishes.
- **Stale password-strength and verification results.** Both now use a sequence guard, so a slow
  earlier response can no longer overwrite a newer verdict — previously a verification result could
  be recorded against the wrong archive in the recents list.
- **"Show in folder" never worked.** It called the shell plugin's `open` with a directory path, which
  its default scope always rejects, and the error was swallowed by an empty `catch`. Migrated to
  `tauri-plugin-opener` with reveal-and-highlight semantics; failures are now surfaced in the UI and
  translated in all seven languages.

### Changed

- `Cargo.lock` is now committed. A security tool needs reproducible, auditable dependency versions.
- Argon2id defaults are pinned by a test (`kdf_defaults_are_pinned`) and documented as
  format-critical: because the reader must derive the key before it can read an archive's stored
  parameters, changing the defaults would silently make every existing archive undecryptable.
  Changing them safely requires carrying the parameters in the plaintext fixed header under a new
  format version.

### Added

- `crates/andrii-core/tests/security.rs` — regression tests that build genuinely hostile archives
  (re-sealed so the reader authenticates them) and assert extraction refuses traversal and absolute
  paths, that absurd length fields are rejected rather than allocated, and that honest archives still
  extract unchanged.
- Decompression-bomb and boundary tests in `andrii-compress`.
- `README.md`, `LICENSE` (MIT), this changelog, and a vulnerability-disclosure section in
  `docs/SECURITY.md`.

## [1.0.0] — 2026-07

Initial release: `.andrii` container format (v1/v2/v3), Argon2id + XChaCha20-Poly1305 + BLAKE3,
Zstd compression, Tauri v2 desktop app in seven languages, Windows and Linux packaging.
