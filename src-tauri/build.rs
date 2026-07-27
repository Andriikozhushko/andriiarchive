fn main() {
    // Embed the Windows application manifest (ComCtl32 v6 / visual styles, DPI
    // awareness, long-path support). ComCtl32 v6 is required so imports like
    // comctl32!TaskDialogIndirect resolve; without the manifest the loader binds
    // them against the legacy v5 in System32 and fails with STATUS_ENTRYPOINT_NOT_FOUND.
    //
    // embed-manifest writes the COFF object itself, so this needs no windres /
    // mt.exe / MinGW / MSVC — it restores the manifest the patched tauri-winres
    // no longer embeds.
    #[cfg(windows)]
    {
        use embed_manifest::{embed_manifest, new_manifest};

        // Embed the app icon (RT_ICON) directly into the .exe as a standalone
        // resource. The vendored tauri-winres is no-op'd (to keep the GNU rustup
        // toolchain self-contained), so without this the .exe file — and the
        // Start Menu / Desktop shortcuts NSIS creates from it — show the default
        // Windows icon. `1 ICON` is a different resource type than the manifest
        // (RT_MANIFEST / type 24), so the two COFF objects never collide. Compiled
        // via windres on the GNU toolchain, rc.exe on MSVC.
        let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR unset");
        let icon = std::path::Path::new(&manifest_dir)
            .join("icons")
            .join("icon.ico");
        let out_dir = std::env::var("OUT_DIR").expect("OUT_DIR unset");
        let rc = std::path::Path::new(&out_dir).join("andrii-icon.rc");
        // windres treats backslash as an escape inside .rc strings, so use forward
        // slashes in the path (accepted by both windres and rc.exe).
        let icon_path = icon.display().to_string().replace('\\', "/");
        std::fs::write(&rc, format!("1 ICON \"{}\"\n", icon_path))
            .expect("unable to write andrii-icon.rc");
        embed_resource::compile(&rc, embed_resource::NONE)
            .manifest_optional()
            .unwrap();

        embed_manifest(new_manifest("ANDRII")).expect("unable to embed manifest file");
    }

    tauri_build::build();
}
