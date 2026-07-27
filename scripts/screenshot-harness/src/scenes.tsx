/**
 * ANDRII screenshot scenes.
 *
 * Each scene mounts a REAL desktop-app component in a fixed, representative
 * state. No app source is modified and no UI is faked — the only thing mocked
 * is the Tauri backend (see src/mocks), which returns canned data so the
 * components render without the Tauri runtime. What you see is the genuine app
 * UI at the genuine viewport.
 *
 * Demo data uses realistic, non-personal filenames and no absolute paths,
 * usernames, passwords or secrets.
 */
import { useEffect, useState } from "react";
import App from "../../../src/App";
import CreateArchive from "../../../src/pages/CreateArchive";
import ArchiveProgress from "../../../src/components/ArchiveProgress";
import SecurityReport from "../../../src/components/SecurityReport";
import { UnlockedArchive } from "../../../src/pages/OpenArchive";
import VerifyArchive from "../../../src/pages/VerifyArchive";
import Settings from "../../../src/components/Settings";
import TitleBar, { type NavTarget } from "../../../src/components/TitleBar";
import type { CanvasState, CreateArchiveResponse, OpenArchiveResponse, ProgressEvent, VerifyResult } from "../../../src/types";

/* ── Demo dataset ─────────────────────────────────────────────────────────── */

const DEMO_FILES = [
  "atlas-research/notes.txt",
  "atlas-research/outline.md",
  "atlas-research/data-samples.csv",
  "atlas-research/figures/plot-01.svg",
  "atlas-research/figures/plot-02.svg",
  "atlas-research/draft-chapter-1.md",
  "atlas-research/references.bib",
  "atlas-research/README.md",
];

const SIZES: Record<string, { size: number; isDirectory: boolean }> = {
  "atlas-research/notes.txt": { size: 4_200, isDirectory: false },
  "atlas-research/outline.md": { size: 8_800, isDirectory: false },
  "atlas-research/data-samples.csv": { size: 512_000, isDirectory: false },
  "atlas-research/figures/plot-01.svg": { size: 24_500, isDirectory: false },
  "atlas-research/figures/plot-02.svg": { size: 26_800, isDirectory: false },
  "atlas-research/draft-chapter-1.md": { size: 184_000, isDirectory: false },
  "atlas-research/references.bib": { size: 15_600, isDirectory: false },
  "atlas-research/README.md": { size: 3_100, isDirectory: false },
};

const TOTAL_ORIG = 778_800; // sum of the above (≈ 760 KB)
const TOTAL_COMP = 312_000; // ≈ 60% saved — a compressible, text-heavy workload

const SEALED_RESULT: CreateArchiveResponse = {
  output_path: "atlas-research.andrii",
  file_count: 8,
  total_original_size: TOTAL_ORIG,
  total_compressed_size: TOTAL_COMP,
  compression_ratio: TOTAL_COMP / TOTAL_ORIG,
};

const PROGRESS: ProgressEvent = {
  phase: "compressing",
  files_done: 5,
  files_total: 8,
  bytes_done: 421_000,
  bytes_total: TOTAL_ORIG,
  percent: 54,
  current_file: "atlas-research/draft-chapter-1.md",
};

const OPEN_INFO: OpenArchiveResponse = {
  archive_name: "atlas-research.andrii",
  created_at: 1_719_400_000,
  creator_version: "1.0.0",
  compression: "Balanced",
  file_count: 8,
  total_original_size: TOTAL_ORIG,
  total_compressed_size: TOTAL_COMP,
  format_version: 2,
  entries: DEMO_FILES.map((path, i) => ({
    path,
    original_size: SIZES[path].size,
    compressed_size: Math.round(SIZES[path].size * 0.4),
    modified_at: 1_719_400_000 - i * 3600,
    compression_ratio: 0.4,
  })),
};

const VERIFY_INTACT: VerifyResult = {
  is_valid: true,
  has_valid_magic: true,
  format_version: 2,
  version_supported: true,
  integrity_hash_valid: true,
  file_size: TOTAL_COMP,
  error: null,
};

const VERIFY_TAMPERED: VerifyResult = {
  is_valid: false,
  has_valid_magic: true,
  format_version: 2,
  version_supported: true,
  integrity_hash_valid: false,
  file_size: TOTAL_COMP + 2048,
  error: null,
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const noop = () => {};

function Frame({
  canvasState,
  activeSettings = false,
  children,
}: {
  canvasState: CanvasState;
  activeSettings?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TitleBar canvasState={canvasState} activeSettings={activeSettings} onNavigate={noop as (t: NavTarget) => void} />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

/** Apply per-scene mock state to window before rendering. */
function useMockSetup(scene: string) {
  useEffect(() => {
    const m = (window.__MOCK__ ??= {});
    m.stat = SIZES;
    m.appInfo = { version: "1.0.0", format_version: 3 };
    m.verifyResult =
      scene === "verify-tampered" ? VERIFY_TAMPERED : VERIFY_INTACT;
    // Pretend onboarding is done so <App/> shows the home screen directly.
    try {
      localStorage.setItem("andrii.onboarded", "1");
      localStorage.setItem("andrii.lang", "en");
    } catch { /* ignore */ }
  }, [scene]);
}

/* ── Scenes ───────────────────────────────────────────────────────────────── */

function HomeScene() {
  useMockSetup("home");
  return <App />;
}

function CreateFilesScene() {
  useMockSetup("create-files");
  return (
    <Frame canvasState={{ mode: "create", files: DEMO_FILES }}>
      <CreateArchive
        files={DEMO_FILES}
        isDragging={false}
        onFilesChange={noop}
        onCreated={noop}
        onClear={noop}
      />
    </Frame>
  );
}

function ProgressScene() {
  useMockSetup("progress");
  return (
    <Frame canvasState={{ mode: "create", files: DEMO_FILES }}>
      <ArchiveProgress progress={PROGRESS} />
    </Frame>
  );
}

function SealedScene() {
  useMockSetup("sealed");
  return (
    <Frame
      canvasState={{
        mode: "created",
        result: SEALED_RESULT,
        passwordAnalysis: null,
        compressionLabel: "Balanced",
        durationMs: 4_200,
      }}
    >
      <SecurityReport
        result={SEALED_RESULT}
        passwordAnalysis={null}
        compressionLabel="Balanced"
        durationMs={4_200}
        onDone={noop}
        onCreateAnother={noop}
      />
    </Frame>
  );
}

function OpenScene() {
  useMockSetup("open");
  return (
    <Frame
      canvasState={{
        mode: "unlocked",
        archivePath: "atlas-research.andrii",
        password: "••••••••••••",
        info: OPEN_INFO,
      }}
    >
      <UnlockedArchive
        archivePath="atlas-research.andrii"
        password="••••••••••••"
        info={OPEN_INFO}
        onClose={noop}
      />
    </Frame>
  );
}

function VerifyScene() {
  useMockSetup("verify-intact");
  return (
    <Frame canvasState={{ mode: "verify", archivePath: "atlas-research.andrii" }}>
      <VerifyArchive archivePath="atlas-research.andrii" onBack={noop} />
    </Frame>
  );
}

function VerifyTamperedScene() {
  useMockSetup("verify-tampered");
  return (
    <Frame canvasState={{ mode: "verify", archivePath: "atlas-research.andrii" }}>
      <VerifyArchive archivePath="atlas-research.andrii" onBack={noop} />
    </Frame>
  );
}

function SettingsScene() {
  useMockSetup("settings");
  return (
    <Frame canvasState={{ mode: "settings" }} activeSettings>
      <Settings onBack={noop} onReplayOnboarding={noop} />
    </Frame>
  );
}

const SCENES: Record<string, () => JSX.Element> = {
  home: HomeScene,
  "create-files": CreateFilesScene,
  progress: ProgressScene,
  sealed: SealedScene,
  open: OpenScene,
  "verify-intact": VerifyScene,
  "verify-tampered": VerifyTamperedScene,
  settings: SettingsScene,
};

export default function SceneRouter() {
  const [scene, setScene] = useState<string>(() => location.hash.replace(/^#/, "") || "home");

  useEffect(() => {
    const onHash = () => setScene(location.hash.replace(/^#/, "") || "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const Scene = SCENES[scene] ?? HomeScene;
  return <Scene />;
}
