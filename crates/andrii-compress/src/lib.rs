pub mod error;

pub use error::CompressError;
use serde::{Deserialize, Serialize};
use std::io::Read;

/// Compression level profile.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CompressionLevel {
    /// Fast compression — zstd level 1. Best for large files or time-sensitive operations.
    Fast,
    /// Balanced compression — zstd level 6. Good ratio with reasonable speed.
    Balanced,
    /// Maximum compression — zstd level 19. Best ratio, slower.
    Maximum,
    /// No compression — store raw bytes. Useful for already-compressed content.
    None,
}

impl CompressionLevel {
    fn zstd_level(self) -> i32 {
        match self {
            Self::Fast => 1,
            Self::Balanced => 6,
            Self::Maximum => 19,
            Self::None => 0,
        }
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            Self::Fast => "Fast",
            Self::Balanced => "Balanced",
            Self::Maximum => "Maximum",
            Self::None => "None",
        }
    }
}

impl Default for CompressionLevel {
    fn default() -> Self {
        Self::Balanced
    }
}

/// Compress bytes using the specified level.
pub fn compress(data: &[u8], level: CompressionLevel) -> Result<Vec<u8>, CompressError> {
    if level == CompressionLevel::None {
        return Ok(data.to_vec());
    }
    zstd::encode_all(data, level.zstd_level()).map_err(CompressError::CompressionFailed)
}

/// Absolute ceiling for a single `decompress` call when the caller has no exact
/// expected size. Nothing the writer produces inflates past this in one call.
pub const MAX_DECOMPRESSED: usize = 512 * 1024 * 1024;

/// Initial buffer reservation — deliberately NOT the caller's expected size, so
/// an attacker-chosen length can never drive a huge up-front allocation.
const INITIAL_CAPACITY: usize = 1024 * 1024;

/// Decompress zstd bytes, refusing to inflate beyond `expected_size`.
///
/// The bound is enforced *during* inflation rather than checked afterwards: a
/// decompression bomb (a small sealed chunk that expands to many GB) is stopped
/// while it streams, so it can never exhaust memory or fill the disk. When no
/// expected size is given the [`MAX_DECOMPRESSED`] ceiling applies.
pub fn decompress(data: &[u8], expected_size: Option<usize>) -> Result<Vec<u8>, CompressError> {
    let limit = expected_size.unwrap_or(MAX_DECOMPRESSED).min(MAX_DECOMPRESSED);

    let decoder =
        zstd::Decoder::new(data).map_err(|e| CompressError::DecompressionFailed(e.to_string()))?;

    // Read one byte past the limit: if it materialises, the stream was longer
    // than the archive metadata claims and the input is hostile or corrupt.
    let mut out = Vec::with_capacity(limit.min(INITIAL_CAPACITY));
    decoder
        .take(limit as u64 + 1)
        .read_to_end(&mut out)
        .map_err(|e| CompressError::DecompressionFailed(e.to_string()))?;

    if out.len() > limit {
        return Err(CompressError::DecompressionFailed(format!(
            "decompressed data exceeds the declared {limit} bytes (possible decompression bomb)"
        )));
    }
    Ok(out)
}

/// Estimate whether compression is beneficial for this data.
/// Returns false for already-compressed data (high entropy).
/// Relaxed threshold: 2% compression is enough to be worthwhile (was 5%).
pub fn should_compress(data: &[u8]) -> bool {
    if data.len() < 64 {
        return false;
    }
    // Sample the first 4KB to estimate entropy
    let sample = &data[..data.len().min(4096)];
    let compressed = zstd::encode_all(sample, 1).unwrap_or_default();
    // If compression ratio < 0.98 (≥2% saving), compression is worthwhile.
    (compressed.len() as f64 / sample.len() as f64) < 0.98
}

/// File extensions that are always worth compressing — source code, markup,
/// configuration, and text-based formats. These skip the entropy check in
/// [`decide_level`] and are compressed at the selected level unconditionally.
const COMPRESSIBLE_EXTS: &[&str] = &[
    // source code
    "rs", "rlib", "ts", "tsx", "js", "jsx", "mjs", "cjs",
    "py", "pyi", "pyx",
    "java", "kt", "kts", "scala", "groovy",
    "c", "cpp", "cxx", "cc", "h", "hpp", "hxx",
    "go", "rb", "php", "swift", "cs", "fs", "fsx", "vb", "vbs",
    "sh", "bash", "zsh", "fish", "ps1", "bat", "cmd",
    "yaml", "yml", "toml", "ini", "cfg", "conf", "properties",
    "txt", "text", "md", "markdown", "rst", "tex", "latex", "bib",
    "xml", "svg", "html", "htm", "css", "scss", "sass", "less",
    "json", "jsonl", "json5", "csv", "tsv", "log",
    "diff", "patch", "env", "example", "sample",
    "makefile", "make", "mk", "cmake", "meson", "just",
    "dockerfile", "dockerignore", "gitignore", "editorconfig",
    "nix", "proto", "thrift", "graphql", "gql", "prisma",
    "lock", "toml",
    "tf", "tfvars", "hcl",
    "sql", "plsql", "psql",
    "lua", "vim", "el", "elisp",
    "r", "rmd", "rnw",
    "dart", "ex", "exs", "erl", "hrl",
    "hs", "lhs", "elm", "ml", "mli",
    "nim", "zig", "odin", "vala", "genie",
    "wgsl", "glsl", "hlsl",
    "hack", "hackpartial",
    "svelte", "vue", "astro",
    "heex", "eex", "leex",
    "j2", "jinja", "tera", "mustache", "handlebars",
    "pl", "pm", "t",
    "cbl", "cob", "cpy",
    "clj", "cljs", "cljc", "edn",
    "purs", "dhall", "nickel",
    "cue", "jsonnet", "libsonnet",
    "ncl",
    "f90", "f95", "f03", "f08",
    "jl",
    "lean",
    "move",
    "slint",
    "wgsl",
    "smithy",
];

/// Check whether a path's extension is in the given set.
fn ext_in_set(path: &str, set: &[&str]) -> bool {
    let ext = path
        .rsplit(['/', '\\'])
        .next()
        .and_then(|name| name.rsplit('.').next().filter(|e| !e.is_empty() && *e != name))
        .map(|e| e.to_ascii_lowercase());
    match ext {
        Some(e) => set.contains(&e.as_str()),
        None => false,
    }
}

/// File extensions that are already compressed; trying to zstd them wastes time
/// for ~0% gain. Matched case-insensitively against the path's extension.
const INCOMPRESSIBLE_EXTS: &[&str] = &[
    // images
    "jpg", "jpeg", "png", "gif", "webp", "heic", "heif", "avif",
    // video
    "mp4", "m4v", "mov", "mkv", "avi", "webm", "wmv", "flv",
    // audio
    "mp3", "aac", "ogg", "oga", "opus", "flac", "m4a", "wma",
    // archives / already-compressed containers
    "zip", "7z", "rar", "gz", "tgz", "bz2", "xz", "zst", "lz4", "br", "cab",
    // documents that embed compression
    "pdf", "docx", "xlsx", "pptx", "odt", "ods", "odp", "epub",
    // packages / binaries
    "jar", "apk", "ipa", "dmg", "exe", "msi", "appimage", "crx", "nupkg",
];

/// Heuristic: is this file most likely already compressed, judging only by its
/// path extension? Used to skip pointless zstd work entirely.
pub fn is_probably_incompressible(path: &str) -> bool {
    ext_in_set(path, INCOMPRESSIBLE_EXTS)
}

/// True when the file extension is a source code, markup, config or text format
/// that virtually always compresses well. These formats skip the entropy
/// sampling step and are compressed unconditionally.
pub fn is_compressible_source(path: &str) -> bool {
    ext_in_set(path, COMPRESSIBLE_EXTS)
}

/// Decide the effective per-file compression level given the user-selected
/// `mode`, the file's path, and a sample of its leading bytes.
///
/// Returns [`CompressionLevel::None`] (store raw) when compression is unlikely
/// to help, so already-compressed media doesn't burn CPU for ~0% gain.
///
/// Strategy per mode:
/// - `Fast`     — skip known-compressed extensions, always compress source
///                 formats, otherwise zstd-1 (no sampling needed).
/// - `Balanced` — same skip list, always compress source formats, then an
///                 entropy check for unknown extensions.
/// - `Maximum`  — same as Balanced but zstd-19 for compressible files.
pub fn decide_level(path: &str, sample: &[u8], mode: CompressionLevel) -> CompressionLevel {
    if mode == CompressionLevel::None {
        return CompressionLevel::None;
    }
    // Incompressible (media / archive / package) → raw.
    if is_probably_incompressible(path) {
        return CompressionLevel::None;
    }
    // Known source / text / doc formats → always compress.
    if is_compressible_source(path) {
        return mode;
    }
    // Unknown extensions → entropy sample for Balanced/Maximum.
    match mode {
        CompressionLevel::Fast => CompressionLevel::Fast,
        CompressionLevel::Balanced | CompressionLevel::Maximum => {
            if should_compress(sample) { mode } else { CompressionLevel::None }
        }
        CompressionLevel::None => CompressionLevel::None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compress_decompress_roundtrip() {
        let data = b"ANDRII secure archive test data - repeated pattern ".repeat(100);
        for level in [CompressionLevel::Fast, CompressionLevel::Balanced, CompressionLevel::Maximum] {
            let compressed = compress(&data, level).unwrap();
            let decompressed = decompress(&compressed, Some(data.len())).unwrap();
            assert_eq!(data.as_slice(), decompressed.as_slice(), "Roundtrip failed for {:?}", level);
        }
    }

    #[test]
    fn test_compress_reduces_size_for_repetitive_data() {
        let data = vec![0u8; 10_000];
        let compressed = compress(&data, CompressionLevel::Balanced).unwrap();
        assert!(compressed.len() < data.len() / 10, "Expected high compression ratio");
    }

    #[test]
    fn test_none_level_is_passthrough() {
        let data = b"raw bytes, no compression";
        let result = compress(data, CompressionLevel::None).unwrap();
        assert_eq!(result, data);
    }

    #[test]
    fn test_empty_data() {
        let compressed = compress(&[], CompressionLevel::Balanced).unwrap();
        let decompressed = decompress(&compressed, Some(0)).unwrap();
        assert!(decompressed.is_empty());
    }

    #[test]
    fn test_incompressible_extensions() {
        assert!(is_probably_incompressible("photo.JPG"));
        assert!(is_probably_incompressible("dir/sub/movie.mp4"));
        assert!(is_probably_incompressible(r"C:\path\archive.zip"));
        assert!(!is_probably_incompressible("notes.txt"));
        assert!(!is_probably_incompressible("src/main.rs"));
        assert!(!is_probably_incompressible("README")); // no extension
    }

    #[test]
    fn test_decide_level_skips_media() {
        // Known-compressed extension → raw regardless of mode.
        let sample = vec![0u8; 4096];
        for mode in [CompressionLevel::Fast, CompressionLevel::Balanced, CompressionLevel::Maximum] {
            assert_eq!(decide_level("clip.mp4", &sample, mode), CompressionLevel::None);
        }
    }

    #[test]
    fn test_decide_level_compresses_text() {
        let text = b"the quick brown fox ".repeat(500); // highly compressible
        assert_eq!(decide_level("a.txt", &text, CompressionLevel::Fast), CompressionLevel::Fast);
        assert_eq!(decide_level("a.txt", &text, CompressionLevel::Balanced), CompressionLevel::Balanced);
        assert_eq!(decide_level("a.txt", &text, CompressionLevel::Maximum), CompressionLevel::Maximum);
    }

    #[test]
    fn test_decide_level_balanced_skips_high_entropy() {
        // Unknown extension but high-entropy content → Balanced/Maximum store raw.
        let mut data = vec![0u8; 8192];
        let mut x: u64 = 0x9E37_79B9_7F4A_7C15;
        for b in data.iter_mut() {
            x ^= x << 13;
            x ^= x >> 7;
            x ^= x << 17;
            *b = (x >> 24) as u8;
        }
        assert_eq!(decide_level("blob.bin", &data, CompressionLevel::Balanced), CompressionLevel::None);
    }

    #[test]
    fn test_compressible_source_ext_always_compresses() {
        // Source/whitelist extensions skip the entropy check entirely.
        let mut data = vec![0u8; 8192];
        let mut x: u64 = 1;
        for b in data.iter_mut() {
            x ^= x << 13;
            x ^= x >> 7;
            x ^= x << 17;
            *b = (x >> 24) as u8;
        }
        // Even high-entropy content with a whitelisted ext still gets compressed.
        assert_eq!(decide_level("main.rs", &data, CompressionLevel::Balanced), CompressionLevel::Balanced);
        assert_eq!(decide_level("Component.tsx", &data, CompressionLevel::Maximum), CompressionLevel::Maximum);
        assert_eq!(decide_level("setup.py", &data, CompressionLevel::Fast), CompressionLevel::Fast);
    }

    #[test]
    fn test_decompress_rejects_bomb() {
        // 64 MiB of zeros compresses to a few KB — the classic bomb shape.
        let bomb = compress(&vec![0u8; 64 * 1024 * 1024], CompressionLevel::Maximum).unwrap();
        assert!(bomb.len() < 100_000, "test fixture should be tiny once compressed");

        // A caller expecting one chunk's worth must NOT get 64 MiB back.
        let err = decompress(&bomb, Some(1024 * 1024)).unwrap_err();
        assert!(
            err.to_string().contains("exceeds"),
            "expected a size-limit error, got: {err}"
        );
    }

    #[test]
    fn test_decompress_allows_exactly_expected_size() {
        // The bound is inclusive: data of exactly the declared size must pass.
        let data = b"boundary case ".repeat(1000);
        let compressed = compress(&data, CompressionLevel::Balanced).unwrap();
        let out = decompress(&compressed, Some(data.len())).unwrap();
        assert_eq!(out, data);

        // One byte under the true size must fail rather than silently truncate.
        assert!(decompress(&compressed, Some(data.len() - 1)).is_err());
    }

    #[test]
    fn test_decompress_without_hint_is_still_capped() {
        let data = b"no hint given ".repeat(100);
        let compressed = compress(&data, CompressionLevel::Balanced).unwrap();
        // Small payloads still round-trip when the caller has no exact size.
        assert_eq!(decompress(&compressed, None).unwrap(), data);
    }

    #[test]
    fn test_media_ext_still_raw() {
        let data = vec![0u8; 8192];
        assert_eq!(decide_level("photo.jpg", &data, CompressionLevel::Maximum), CompressionLevel::None);
        assert_eq!(decide_level("clip.mp4", &data, CompressionLevel::Balanced), CompressionLevel::None);
    }
}
