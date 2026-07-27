use argon2::{Argon2, Algorithm, Version, Params};
use rand::{RngCore, rngs::OsRng};
use zeroize::Zeroizing;
use serde::{Deserialize, Serialize};

use crate::error::CryptoError;

pub const SALT_LEN: usize = 32;
pub const KEY_LEN: usize = 32;

/// Argon2id parameters stored alongside the archive for future re-keying.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct KdfParams {
    pub m_cost: u32,
    pub t_cost: u32,
    pub p_cost: u32,
}

/// # ⚠ Format-critical: these values must not change without a version bump
///
/// The parameters used at creation time are recorded inside the *encrypted*
/// header, which cannot be read until the key has already been derived. The
/// reader therefore has no choice but to derive with these defaults
/// (`ArchiveReader::open`), so changing any value here makes **every archive
/// created by an earlier build permanently undecryptable**, reporting a wrong
/// password with a correct one.
///
/// Raising the cost is a legitimate thing to want. Doing it safely requires
/// carrying the parameters in the *plaintext* fixed header, which means a new
/// format version and a reader that picks the parameters per archive — see
/// `docs/ANDRII_FORMAT_SPEC.md`. Until that exists, `kdf_defaults_are_pinned`
/// fails the build's test suite if these values drift.
impl Default for KdfParams {
    fn default() -> Self {
        Self {
            m_cost: 65536, // 64 MiB
            t_cost: 3,
            p_cost: 4,
        }
    }
}

/// Derive a 32-byte master key from a password and salt using Argon2id.
pub fn derive_key(
    password: &str,
    salt: &[u8; SALT_LEN],
    params: &KdfParams,
) -> Result<Zeroizing<[u8; KEY_LEN]>, CryptoError> {
    let argon2_params = Params::new(params.m_cost, params.t_cost, params.p_cost, Some(KEY_LEN))
        .map_err(|e| CryptoError::KdfFailed(e.to_string()))?;

    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, argon2_params);

    let mut key = Zeroizing::new([0u8; KEY_LEN]);
    argon2
        .hash_password_into(password.as_bytes(), salt, key.as_mut())
        .map_err(|e| CryptoError::KdfFailed(e.to_string()))?;

    Ok(key)
}

/// Generate a cryptographically secure random salt.
pub fn generate_salt() -> Result<[u8; SALT_LEN], CryptoError> {
    let mut salt = [0u8; SALT_LEN];
    OsRng.try_fill_bytes(&mut salt).map_err(|_| CryptoError::RngFailed)?;
    Ok(salt)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_derive_key_deterministic() {
        let salt = [0x42u8; SALT_LEN];
        let params = KdfParams { m_cost: 1024, t_cost: 1, p_cost: 1 };
        let key1 = derive_key("testpassword", &salt, &params).unwrap();
        let key2 = derive_key("testpassword", &salt, &params).unwrap();
        assert_eq!(*key1, *key2);
    }

    #[test]
    fn test_derive_key_different_passwords() {
        let salt = [0x42u8; SALT_LEN];
        let params = KdfParams { m_cost: 1024, t_cost: 1, p_cost: 1 };
        let key1 = derive_key("password1", &salt, &params).unwrap();
        let key2 = derive_key("password2", &salt, &params).unwrap();
        assert_ne!(*key1, *key2);
    }

    /// Guards the format invariant documented on `impl Default for KdfParams`.
    ///
    /// If this test fails you have changed the KDF cost. That silently bricks
    /// every archive users already created: the reader must derive the key
    /// before it can read the stored parameters, so it always uses these
    /// defaults and a correct password will be reported as wrong. Do not
    /// "fix" the test — carry the parameters in the plaintext fixed header
    /// under a new format version instead.
    #[test]
    fn kdf_defaults_are_pinned() {
        let d = KdfParams::default();
        assert_eq!(d.m_cost, 65536, "changing m_cost breaks every existing archive");
        assert_eq!(d.t_cost, 3, "changing t_cost breaks every existing archive");
        assert_eq!(d.p_cost, 4, "changing p_cost breaks every existing archive");
    }

    #[test]
    fn test_generate_salt_unique() {
        let s1 = generate_salt().unwrap();
        let s2 = generate_salt().unwrap();
        assert_ne!(s1, s2);
    }
}
