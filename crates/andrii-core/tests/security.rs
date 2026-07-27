//! Security regression tests: hostile archives must never escape the extraction
//! directory, and malformed length fields must never crash the process.
//!
//! These tests build *genuinely hostile* `.andrii` files by tampering with a
//! real archive the way an attacker would — the archive is valid enough that
//! the reader accepts and authenticates it, and the attack lives in the data
//! the format legitimately carries.

use std::fs;
use std::path::{Path, PathBuf};

use tempfile::TempDir;

use andrii_compress::CompressionLevel;
use andrii_core::format::header::{EncryptedHeader, FixedHeader, FIXED_HEADER_SIZE};
use andrii_core::{ArchiveError, ArchiveReader, ArchiveWriter, CreateArchiveOptions};

const PASSWORD: &str = "StrongPass#1!";

fn fixture(name: &str) -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("tests")
        .join("fixtures")
        .join(name)
}

fn make_archive(tmp: &TempDir, name: &str, files: &[PathBuf]) -> PathBuf {
    let output = tmp.path().join(format!("{name}.andrii"));
    let opts = CreateArchiveOptions {
        archive_name: name.to_string(),
        password: PASSWORD.to_string(),
        compression: CompressionLevel::Balanced,
        output_path: output.clone(),
        progress_callback: None,
        force_legacy_v2: false,
    };
    ArchiveWriter::new(opts)
        .create(files)
        .expect("archive creation failed");
    output
}

/// Rewrite the stored path of every entry in a real archive.
///
/// `evil_path` must have the same byte length as the original so the encrypted
/// header keeps its size — that leaves the fixed header (and therefore the AEAD
/// associated data, the data-section offset and the footer) untouched, so the
/// only thing that changes is the attacker-chosen file name. This is exactly
/// the archive a malicious sender would hand over along with the password.
fn forge_entry_path(archive: &Path, evil_path: &str) {
    let raw = fs::read(archive).unwrap();

    let mut fixed_buf = [0u8; FIXED_HEADER_SIZE];
    fixed_buf.copy_from_slice(&raw[..FIXED_HEADER_SIZE]);
    let fixed = FixedHeader::from_bytes(&fixed_buf).unwrap();
    let fixed_bytes = fixed.to_bytes();

    let enc_len = fixed.enc_header_len as usize;
    let enc_start = FIXED_HEADER_SIZE;
    let enc_end = enc_start + enc_len;

    let key = andrii_crypto::kdf::derive_key(
        PASSWORD,
        &fixed.kdf_salt,
        &andrii_crypto::kdf::KdfParams::default(),
    )
    .unwrap();

    let plain = andrii_crypto::cipher::decrypt(
        &key,
        &fixed.header_nonce,
        &raw[enc_start..enc_end],
        &fixed_bytes,
    )
    .expect("test archive must decrypt");

    let mut header = EncryptedHeader::from_json(&plain).unwrap();
    for entry in header.entries.iter_mut() {
        assert_eq!(
            entry.path.len(),
            evil_path.len(),
            "forged path must match the original length to keep the header size stable",
        );
        entry.path = evil_path.to_string();
    }
    let new_plain = header.to_json().unwrap();
    assert_eq!(
        new_plain.len(),
        plain.len(),
        "tampered header changed size; the fixture no longer models the attack",
    );

    // Re-seal with the same key/nonce/AAD: the reader authenticates this happily.
    let new_enc = andrii_crypto::cipher::encrypt(
        &key,
        &fixed.header_nonce,
        &new_plain,
        &fixed_bytes,
    )
    .unwrap();
    assert_eq!(new_enc.len(), enc_len);

    let mut forged = raw.clone();
    forged[enc_start..enc_end].copy_from_slice(&new_enc);
    fs::write(archive, forged).unwrap();
}

// ── Path traversal (zip-slip) ────────────────────────────────────────────────

#[test]
fn extraction_refuses_parent_traversal() {
    let tmp = TempDir::new().unwrap();
    let archive = make_archive(&tmp, "hostile", &[fixture("hello.txt")]);

    // "hello.txt" is 9 bytes; "../ev.txt" is 9 bytes.
    forge_entry_path(&archive, "../ev.txt");

    let out_dir = tmp.path().join("extract_here");
    fs::create_dir_all(&out_dir).unwrap();

    let reader = ArchiveReader::open(&archive, PASSWORD).unwrap();
    let err = reader
        .extract_all(&out_dir)
        .expect_err("traversal must be refused");
    assert!(
        matches!(err, ArchiveError::UnsafePath(..)),
        "expected UnsafePath, got: {err:?}"
    );

    // The decisive assertion: nothing was written outside the chosen folder.
    assert!(
        !tmp.path().join("ev.txt").exists(),
        "file escaped the extraction directory"
    );
}

#[test]
fn extraction_refuses_absolute_paths() {
    let tmp = TempDir::new().unwrap();
    let archive = make_archive(&tmp, "hostile_abs", &[fixture("hello.txt")]);

    // Same length as "hello.txt": an absolute path would make `join` discard
    // the extraction directory entirely.
    forge_entry_path(&archive, "/tmp/ev.t");

    let out_dir = tmp.path().join("extract_here");
    fs::create_dir_all(&out_dir).unwrap();

    let reader = ArchiveReader::open(&archive, PASSWORD).unwrap();
    let err = reader
        .extract_all(&out_dir)
        .expect_err("absolute path must be refused");
    assert!(
        matches!(err, ArchiveError::UnsafePath(..)),
        "expected UnsafePath, got: {err:?}"
    );
}

#[test]
fn honest_archives_still_extract() {
    // The guard must not break the normal path: same pipeline, no tampering.
    let tmp = TempDir::new().unwrap();
    let archive = make_archive(&tmp, "honest", &[fixture("hello.txt")]);

    let out_dir = tmp.path().join("out");
    fs::create_dir_all(&out_dir).unwrap();

    let reader = ArchiveReader::open(&archive, PASSWORD).unwrap();
    let written = reader.extract_all(&out_dir).unwrap();

    assert_eq!(written.len(), 1);
    assert!(written[0].starts_with(&out_dir));
    assert!(out_dir.join("hello.txt").exists());
}

// ── Malformed length fields ──────────────────────────────────────────────────

#[test]
fn absurd_header_length_is_rejected_not_allocated() {
    let tmp = TempDir::new().unwrap();
    let archive = make_archive(&tmp, "bomb_header", &[fixture("hello.txt")]);

    // Patch the plaintext `enc_header_len` field to 1 TiB. Before the fix this
    // reached `vec![0u8; 2^40]`, and the allocation failure aborted the whole
    // process — a crash no caller could catch.
    let mut raw = fs::read(&archive).unwrap();
    raw[68..76].copy_from_slice(&(1u64 << 40).to_le_bytes());
    fs::write(&archive, &raw).unwrap();

    match ArchiveReader::open(&archive, PASSWORD) {
        Err(ArchiveError::Corrupted(_)) => {}
        Err(other) => panic!("expected Corrupted, got: {other:?}"),
        Ok(_) => panic!("absurd header length must be rejected"),
    }
}

#[test]
fn truncated_archive_fails_cleanly() {
    let tmp = TempDir::new().unwrap();
    let archive = make_archive(&tmp, "truncated", &[fixture("hello.txt")]);

    let raw = fs::read(&archive).unwrap();
    fs::write(&archive, &raw[..raw.len() / 2]).unwrap();

    // Must return an error rather than panicking or aborting.
    let result = ArchiveReader::open(&archive, PASSWORD);
    if let Ok(reader) = result {
        let out_dir = tmp.path().join("out");
        fs::create_dir_all(&out_dir).unwrap();
        assert!(reader.extract_all(&out_dir).is_err());
    }
}
