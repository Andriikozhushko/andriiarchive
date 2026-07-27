/**
 * Mock of @tauri-apps/api/core — canned `invoke` responses for screenshot
 * capture. Scene-specific values (e.g. the verify result) are set on
 * `window.__MOCK__` by the harness before a component mounts.
 */

declare global {
  interface Window {
    __MOCK__?: {
      verifyResult?: unknown;
      appInfo?: { version: string; format_version: number };
    };
  }
}

export async function invoke<T>(cmd: string, _args?: unknown): Promise<T> {
  // Let React settle before resolving so intermediate "verifying" states can
  // paint if a scene wants them. Kept tiny for fast capture.
  await new Promise((r) => setTimeout(r, 60));

  switch (cmd) {
    case "get_startup_archive_path":
      return null as T;
    case "get_app_info":
      return (window.__MOCK__?.appInfo ?? { version: "1.0.0", format_version: 3 }) as T;
    case "verify_archive_cmd":
      return (window.__MOCK__?.verifyResult ?? null) as T;
    case "analyze_password_strength":
      return {
        score: 4,
        label: "Strong",
        entropy_bits: 78,
        estimated_crack_time: "centuries",
        gpu_crack_time: "centuries",
        has_lowercase: true,
        has_uppercase: true,
        has_digits: true,
        has_symbols: true,
        length: 16,
        suggestions: [],
      } as T;
    // create_archive / open_archive / extract_archive are only reached via user
    // clicks, which the harness never performs — they resolve to null safely.
    default:
      return null as T;
  }
}
