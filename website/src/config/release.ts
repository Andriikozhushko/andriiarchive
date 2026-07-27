/**
 * Central release configuration for the ANDRII website.
 *
 * The GitHub release for v1.0.0 is currently an UNPUBLISHED DRAFT. While it is
 * a draft we must NOT link to private/draft asset URLs — so every download
 * control on the site reads from this single file.
 *
 * To activate public downloads after the release is manually published:
 *   1. Publish the GitHub release (do this from the GitHub UI — never from here).
 *   2. Set `releaseState` to `"published"`.
 *   3. (Optional) Paste the real asset URLs into `assets` if they differ from the
 *      generated GitHub Releases download URLs. The defaults already follow the
 *      standard `releases/download/<tag>/<filename>` convention, so usually no
 *      edit is needed.
 *
 * No other code change is required — every download button derives its state and
 * href from the values below.
 */

export type ReleaseState = "draft" | "published";

export interface PlatformAsset {
  /** Stable public filename, matching RELEASE_MATRIX.md. */
  filename: string;
  /** Human label, e.g. "NSIS Setup". */
  label: string;
  /** Short note shown under the button. */
  note: string;
  /** Approximate kind, for iconography only. */
  kind: "exe" | "msi" | "appimage" | "deb";
  /** Human-readable size of the built artifact. */
  size: string;
  /**
   * SHA-256 of the uploaded artifact, straight from the GitHub release.
   * Shown so anyone can verify a download against SHA256SUMS.txt.
   */
  sha256: string;
}

export const release = {
  /** Toggle this to "published" once the GitHub release is live. */
  releaseState: "published" as ReleaseState,

  version: "1.0.0",
  tag: "v1.0.0",

  /** Public GitHub repository. */
  repoUrl: "https://github.com/Andriikozhushko/andriiarchive",
  /** The GitHub Releases page for this repository. */
  releasesUrl: "https://github.com/Andriikozhushko/andriiarchive/releases",
  /** Direct link to the tagged release (resolves once published). */
  releaseUrl:
    "https://github.com/Andriikozhushko/andriiarchive/releases/tag/v1.0.0",

  /** Honest status string shown while the release is still a draft. */
  draftStatus: "Релиз-кандидат на финальной проверке",

  /** Checksum manifest published alongside the binaries. */
  checksumsFile: "SHA256SUMS.txt",

  /**
   * Sizes and SHA-256 digests are the real values of the artifacts currently
   * attached to the v1.0.0 release on GitHub. Update them whenever the release
   * assets are rebuilt.
   */
  assets: {
    windows: [
      {
        filename: "ANDRII_1.0.0_x64-setup.exe",
        label: "Windows — установщик",
        note: "EXE, x64",
        kind: "exe" as const,
        size: "5.9 MB",
        sha256: "c009a5fe1c622d72f5baf38220fdfeb055e3f59fcf426c6375c5853c402286a7",
      },
      {
        filename: "ANDRII_1.0.0_x64_en-US.msi",
        label: "Windows — MSI",
        note: "MSI, x64",
        kind: "msi" as const,
        size: "6.4 MB",
        sha256: "0309a947dcca002cc2787a693efe6e4d854eaf38d37aefa7c1d7118ba8d5c5cc",
      },
    ],
    linux: [
      {
        filename: "ANDRII_1.0.0_x64.AppImage",
        label: "Linux — AppImage",
        note: "Портативный, x64",
        kind: "appimage" as const,
        size: "80.7 MB",
        sha256: "9ac85ae794d8059719e1e7c319b29cc8a2df3e674aaeea97b76422cb5d9e18b9",
      },
      {
        filename: "ANDRII_1.0.0_amd64.deb",
        label: "Linux — DEB",
        note: "Debian / Ubuntu, x64",
        kind: "deb" as const,
        size: "6.5 MB",
        sha256: "42e2a10d4f25c735fc89269f42aa19273dc15b6b7d28ec986e085db5843c2ac2",
      },
    ],
  } satisfies Record<"windows" | "linux", PlatformAsset[]>,
} as const;

/** Whether public download links are live. */
export const downloadsLive = release.releaseState === "published";

/** URL of the checksum manifest for the current release. */
export function checksumsUrl(): string {
  return `${release.releasesUrl}/download/${release.tag}/${release.checksumsFile}`;
}

/**
 * The public download URL for an asset. Only meaningful when `downloadsLive`
 * is true; while the release is a draft the UI must not render this as a link.
 */
export function assetUrl(asset: PlatformAsset): string {
  return `${release.releasesUrl}/download/${release.tag}/${asset.filename}`;
}

/** The URL a "downloads" call-to-action should point to in the current state. */
export function downloadCtaHref(): string {
  return downloadsLive ? release.releaseUrl : release.repoUrl;
}
