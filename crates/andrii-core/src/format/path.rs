//! Extraction-path safety.
//!
//! Entry paths inside an archive are attacker-controlled data: a `.andrii` file
//! can be handed to a user together with its password ("here's the file you
//! asked for"), so nothing stored inside it may be trusted when deciding where
//! bytes land on disk. Every extraction path goes through [`safe_join`].
//!
//! Archives are portable between Windows and Unix, so the checks here are
//! deliberately *host-independent*: `..\evil` must be rejected even when
//! extracting on Linux, where the platform `Path` parser would treat the whole
//! string as one innocent file name.

use std::path::{Component, Path, PathBuf};

use crate::error::ArchiveError;

/// Characters that are never legal in a portable entry component.
///
/// `:` is included because on Windows it opens an NTFS alternate data stream
/// (`notes.txt:payload`), and because it is how drive letters are written.
const FORBIDDEN_CHARS: &[char] = &[':', '<', '>', '"', '|', '?', '*'];

/// Windows device names are still special inside any directory, with or without
/// an extension: writing to `CON.txt` talks to the console, not to a file.
fn is_reserved_device_name(component: &str) -> bool {
    let stem = component.split('.').next().unwrap_or(component);
    let upper = stem.to_ascii_uppercase();
    if matches!(upper.as_str(), "CON" | "PRN" | "AUX" | "NUL") {
        return true;
    }
    (upper.starts_with("COM") || upper.starts_with("LPT"))
        && upper.len() == 4
        && upper.as_bytes()[3].is_ascii_digit()
}

/// Validate an archive-internal path and return it as a relative `PathBuf`.
///
/// Rejects absolute paths, drive prefixes, `..` traversal, control characters,
/// NTFS stream separators, reserved device names, and trailing dots/spaces
/// (which Windows silently strips, letting `foo. ` alias `foo`).
pub fn sanitize_entry_path(entry_path: &str) -> Result<PathBuf, ArchiveError> {
    let reject = |reason: &str| {
        ArchiveError::UnsafePath(entry_path.to_string(), reason.to_string())
    };

    if entry_path.is_empty() {
        return Err(reject("path is empty"));
    }
    if entry_path.starts_with('/') || entry_path.starts_with('\\') {
        return Err(reject("path is absolute"));
    }

    let mut out = PathBuf::new();
    let mut components = 0usize;

    // Split on BOTH separators regardless of host OS — see the module note.
    for raw in entry_path.split(['/', '\\']) {
        match raw {
            // Collapse `a//b` and `./a`; neither changes where the file lands.
            "" | "." => continue,
            ".." => return Err(reject("contains a `..` component")),
            _ => {}
        }
        if raw
            .chars()
            .any(|c| FORBIDDEN_CHARS.contains(&c) || (c as u32) < 0x20)
        {
            return Err(reject("component contains a forbidden character"));
        }
        if raw.ends_with('.') || raw.ends_with(' ') {
            return Err(reject("component ends with a dot or space"));
        }
        if is_reserved_device_name(raw) {
            return Err(reject("component is a reserved device name"));
        }
        out.push(raw);
        components += 1;
    }

    if components == 0 {
        return Err(reject("path has no usable components"));
    }
    Ok(out)
}

/// Resolve an entry path against the extraction directory, fail-closed.
///
/// The returned path is guaranteed to sit inside `output_dir`.
pub fn safe_join(output_dir: &Path, entry_path: &str) -> Result<PathBuf, ArchiveError> {
    let relative = sanitize_entry_path(entry_path)?;
    let joined = output_dir.join(&relative);

    // Belt and braces: the sanitizer already removed every escape route, so a
    // failure here means the two disagree — refuse rather than guess.
    let escapes = relative
        .components()
        .any(|c| !matches!(c, Component::Normal(_)));
    if escapes || !joined.starts_with(output_dir) {
        return Err(ArchiveError::UnsafePath(
            entry_path.to_string(),
            "resolves outside the extraction directory".to_string(),
        ));
    }
    Ok(joined)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_parent_traversal_both_separators() {
        for evil in [
            "../evil.txt",
            "..\\evil.txt",
            "a/../../evil.txt",
            "a\\..\\..\\evil.txt",
            "docs/../../../Users/victim/.ssh/authorized_keys",
            "..",
        ] {
            assert!(
                sanitize_entry_path(evil).is_err(),
                "traversal not rejected: {evil}"
            );
        }
    }

    #[test]
    fn rejects_absolute_and_drive_paths() {
        for evil in [
            "/etc/passwd",
            "\\Windows\\System32\\evil.dll",
            "C:/Users/victim/evil.exe",
            "C:\\Users\\victim\\evil.exe",
            "\\\\server\\share\\evil.exe",
        ] {
            assert!(
                sanitize_entry_path(evil).is_err(),
                "absolute path not rejected: {evil}"
            );
        }
    }

    #[test]
    fn rejects_streams_devices_and_control_chars() {
        assert!(sanitize_entry_path("notes.txt:payload").is_err());
        assert!(sanitize_entry_path("CON").is_err());
        assert!(sanitize_entry_path("nul.txt").is_err());
        assert!(sanitize_entry_path("dir/COM1.log").is_err());
        assert!(sanitize_entry_path("bad\u{0}name").is_err());
        assert!(sanitize_entry_path("trailing. ").is_err());
        assert!(sanitize_entry_path("trailing.").is_err());
    }

    #[test]
    fn accepts_ordinary_paths_and_normalizes_separators() {
        let p = sanitize_entry_path("docs/notes.txt").unwrap();
        assert_eq!(p, PathBuf::from("docs").join("notes.txt"));

        // Windows-style separators from an archive built on Windows.
        let p = sanitize_entry_path("docs\\sub\\notes.txt").unwrap();
        assert_eq!(p, PathBuf::from("docs").join("sub").join("notes.txt"));

        // Redundant components collapse rather than fail.
        let p = sanitize_entry_path("./docs//notes.txt").unwrap();
        assert_eq!(p, PathBuf::from("docs").join("notes.txt"));

        // A dotfile is not a traversal.
        assert!(sanitize_entry_path(".gitignore").is_ok());
    }

    #[test]
    fn safe_join_keeps_everything_under_the_output_dir() {
        let base = Path::new("/tmp/out");
        let ok = safe_join(base, "docs/notes.txt").unwrap();
        assert!(ok.starts_with(base));

        assert!(safe_join(base, "../escape.txt").is_err());
        assert!(safe_join(base, "C:/escape.txt").is_err());
    }
}
