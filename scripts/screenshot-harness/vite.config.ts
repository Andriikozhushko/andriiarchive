import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../.."); // repo root
const mocks = path.resolve(here, "src/mocks");

/**
 * The harness renders the REAL desktop-app React components (from ../../../src)
 * with the app's own globals.css + tailwind theme. The Tauri packages are
 * aliased to local mocks so the components mount in a plain browser without the
 * Tauri runtime. No app source is modified.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@tauri-apps/api/core": path.resolve(mocks, "core.ts"),
      "@tauri-apps/api/event": path.resolve(mocks, "event.ts"),
      "@tauri-apps/api/window": path.resolve(mocks, "window.ts"),
      "@tauri-apps/plugin-dialog": path.resolve(mocks, "dialog.ts"),
      "@tauri-apps/plugin-fs": path.resolve(mocks, "fs.ts"),
      "@tauri-apps/plugin-shell": path.resolve(mocks, "shell.ts"),
    },
    preserveSymlinks: false,
  },
  server: {
    port: 4180,
    strictPort: true,
    fs: { allow: [root] },
  },
  build: { outDir: "dist" },
});
