/** Mock of @tauri-apps/plugin-fs. CreateArchive calls stat() on each added file
 *  to show its size; the harness provides a canned size map via window.__MOCK__. */

declare global {
  interface Window {
    __MOCK__?: {
      stat?: Record<string, { size: number; isDirectory: boolean }>;
    };
  }
}

export interface MockStat {
  size: number;
  isDirectory: boolean;
  mtime: number;
  atime: number;
  birthtime: number;
}

export async function stat(path: string): Promise<MockStat> {
  const entry = window.__MOCK__?.stat?.[path] ?? { size: 1024, isDirectory: false };
  return {
    size: entry.size,
    isDirectory: entry.isDirectory,
    mtime: 1_719_400_000,
    atime: 1_719_400_000,
    birthtime: 1_719_400_000,
  };
}

export async function readDir(): Promise<{ name: string; isDirectory: boolean }[]> {
  return [];
}
