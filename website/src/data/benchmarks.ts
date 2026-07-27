/**
 * Benchmark figures shown on the website.
 *
 * Every number below is copied verbatim from the repository's reproducible
 * benchmark report (docs/BENCHMARK_REPORT.md). The report was generated with
 * `--quick` (reduced sizes, 1 repetition); full-spec numbers may differ
 * slightly at scale. Re-run with `--full` for definitive results.
 *
 * We do NOT claim ANDRII compresses better than 7-Zip or any dedicated
 * compressor, and we do NOT rank against other products.
 */

export interface BenchmarkRow {
  dataset: string;
  files: number;
  inputMb: string;
  mode: "Fast" | "Balanced" | "Maximum";
  savedPct: number;
}

/** Representative per-dataset savings (Balanced mode, from the report). */
export const benchmarkRows: BenchmarkRow[] = [
  { dataset: "Text (small)", files: 200, inputMb: "10.0 MB", mode: "Balanced", savedPct: 79.8 },
  { dataset: "Source code", files: 212, inputMb: "7.3 MB", mode: "Balanced", savedPct: 21.3 },
  { dataset: "Many small files", files: 2000, inputMb: "4.0 MB", mode: "Balanced", savedPct: 54.8 },
  { dataset: "Mixed realistic", files: 327, inputMb: "108.9 MB", mode: "Balanced", savedPct: 47.0 },
  { dataset: "Documents (mixed)", files: 10, inputMb: "50.0 MB", mode: "Balanced", savedPct: 0.0 },
  { dataset: "Incompressible media", files: 7, inputMb: "101.0 MB", mode: "Balanced", savedPct: 0.0 },
  { dataset: "Large binary", files: 1, inputMb: "64.0 MB", mode: "Balanced", savedPct: 0.0 },
];

/**
 * v3 "Maximum" solid-group compression vs the v2 per-file layout, for the same
 * files (from §4b of the report). Largest gains are on many-small-file and text
 * workloads; ~zero on already-compressed media, where v3 correctly falls back.
 */
export interface SolidGainRow {
  dataset: string;
  v2: string;
  v3: string;
  smallerPct: number;
}

export const solidGains: SolidGainRow[] = [
  { dataset: "Text (small)", v2: "1.7 MB", v3: "745.7 KB", smallerPct: 55.9 },
  { dataset: "Many small files", v2: "1.7 MB", v3: "1004.3 KB", smallerPct: 42.7 },
  { dataset: "Mixed realistic", v2: "55.9 MB", v3: "52.8 MB", smallerPct: 5.5 },
  { dataset: "Source code", v2: "5.7 MB", v3: "5.6 MB", smallerPct: 1.6 },
  { dataset: "Documents (mixed)", v2: "50.0 MB", v3: "50.0 MB", smallerPct: 0.0 },
  { dataset: "Incompressible media", v2: "101.0 MB", v3: "101.0 MB", smallerPct: 0.0 },
];

/** Headline verified claims (from docs/BENCHMARK_WEBSITE_SUMMARY.md). */
export const benchmarkClaims: string[] = [
  "Tested on datasets up to 108.9 MB with up to 2000 files.",
  "Streaming creation with bounded memory — peak RAM stays in the low MiB regardless of input size, verified on a 1 GB binary.",
  "Encrypted contents AND metadata — file names, sizes and directory structure are all authenticated-encrypted.",
  "Maximum mode uses v3 solid compression — materially smaller archives on many-small-file and text workloads.",
];

/** Honest limitations we state up front. */
export const benchmarkCaveats: string[] = [
  "Текст и исходный код сжимаются хорошо; уже сжатые медиа (фото, видео, архивы) почти не уменьшаются — приложение честно предупреждает об этом до запечатывания.",
  "Шифрование и защита метаданных добавляют небольшой предсказуемый оверхед: 16-байтовый тег на блок плюс заголовок и футер.",
  "Результаты зависят от входных данных. Набор бенчмарков воспроизводим.",
];

/** Tools compared side-by-side. `logo` keys a brand mark in the UI. */
export interface CompareTool {
  key: "andrii" | "winrar" | "sevenzip" | "winzip" | "windows";
  name: string;
  isAndrii?: boolean;
  /** True for tools that offer no password/encryption at all. */
  open?: boolean;
  /** Honest one-line takeaway — what this tool actually is. */
  verdict: string;
}

export const compareTools: CompareTool[] = [
  {
    key: "andrii",
    name: "ANDRII",
    isAndrii: true,
    verdict: "Memory-hard ключ, AEAD-шифрование и всегда зашифрованные имена, структура и метаданные.",
  },
  {
    key: "winrar",
    name: "WinRAR",
    verdict: "Быстрый архиватор; шифрование имён включается флагом, KDF не memory-hard, код закрыт.",
  },
  {
    key: "sevenzip",
    name: "7-Zip",
    verdict: "Открытый и бесплатный; AES-256, но KDF — SHA-итерации, имена шифруются опцией.",
  },
  {
    key: "winzip",
    name: "WinZip",
    verdict: "Шифрует AES-256, но имена файлов остаются открытыми, KDF — слабый PBKDF2-SHA1, код закрыт.",
  },
  {
    key: "windows",
    name: "Windows ZIP",
    open: true,
    verdict: "Стандартный ZIP Windows («Сжать в ZIP-папку») удобен, но не шифрует и не ставит пароль — содержимое открыто любому.",
  },
];

/** Column order mirrors compareTools. */
export const compareColumns = compareTools.map(t => t.name) as readonly string[];

/**
 * Language-neutral cell tokens, resolved to labels by the site dictionary:
 *  - verdicts: "yes" | "no" | "partial" | "optional" | "always" | "high" | "medium" | "low" | "dash"
 *  - "t:<name>"  — a neutral tech chip (e.g. "t:AES-256")
 *  - "yt:<name>" — yes + tech (e.g. "yt:Argon2id")
 */
export type CompareCell = string;

export interface CompareRow {
  /** Index into the dictionary's compareLabels array. */
  label: number;
  /** One token per column, in the same order as compareTools. */
  values: CompareCell[];
  /** Columns (by index) where this is a genuine, verifiable advantage. */
  win?: number[];
}

/**
 * Factual feature matrix. Every cell is checkable against each tool's own docs;
 * no invented numbers or brute-force "years" — only what the formats actually do.
 * Column order: ANDRII, WinRAR, 7-Zip, WinZip, Windows ZIP.
 */
export const comparison: CompareRow[] = [
  { label: 0, values: ["t:XChaCha20-Poly1305", "t:AES-256", "t:AES-256", "t:AES-256", "no"], win: [0] },
  { label: 1, values: ["yt:Argon2id", "yt:PBKDF2", "yt:SHA-256", "yt:PBKDF2", "no"], win: [0] },
  { label: 2, values: ["high", "medium", "medium", "low", "dash"], win: [0] },
  { label: 3, values: ["yes", "partial", "no", "partial", "no"], win: [0] },
  { label: 4, values: ["always", "optional", "optional", "no", "no"], win: [0] },
  { label: 5, values: ["yes", "partial", "partial", "no", "no"], win: [0] },
  { label: 6, values: ["yes", "no", "yes", "no", "no"] },
];

/** Honest conclusion grounded in the numbers above. */
export const crackAssumption =
  "Расчёт по бенчмаркам hashcat для NVIDIA RTX 4090: скорость подбора выводится из числа итераций KDF и сырой скорости SHA. Memory-hard Argon2id у ANDRII упирается в 24 ГБ видеопамяти, поэтому подбор идёт сотнями паролей в секунду против миллионов у PBKDF2/SHA. Реальная стойкость определяется паролем — короткий или предсказуемый уязвим везде.";

/** Alphabet size for the brute-force estimate: a–z, A–Z, 0–9. */
export const crackAlphabet = 62;

/** The concrete attacker hardware behind the estimate. */
export const crackGpuCount = 12;
export const crackGpuName = "NVIDIA RTX 4090 (24 ГБ)";

/**
 * Attacker throughput (guesses/sec) for a farm of 12× NVIDIA RTX 4090, derived
 * from real hashcat v6 benchmarks on a single 4090:
 *   SHA-1 ≈ 50.6 GH/s, SHA-256 ≈ 21.9 GH/s, Argon2id 64 MiB ≈ a few hundred H/s.
 * Per-card guess rate = raw-hash-rate ÷ KDF iterations, then ×12 for the farm.
 * Relative costs — not a promise about any specific password.
 */
export const crackRatePerSec: Record<CompareTool["key"], number> = {
  andrii: 2.4e3, // Argon2id 64 MiB ·  ~200 H/s/card × 12 (memory-hard, VRAM-bound)
  winrar: 2.0e6, // PBKDF2-SHA256 ×32768 (RAR5) · ~170 kH/s/card × 12
  sevenzip: 5.0e5, // SHA-256 ×524288 (7-Zip) · ~40 kH/s/card × 12
  winzip: 1.2e8, // PBKDF2-SHA1 ×1000 (Zip AES) · ~10 MH/s/card × 12
  windows: Infinity, // built-in ZIP has no password — nothing to brute-force
};

/** Relative link into the repository's benchmark documentation. */
export const benchmarkDocsUrl =
  "https://github.com/Andriikozhushko/andriiarchive/blob/master/docs/BENCHMARK_REPORT.md";
