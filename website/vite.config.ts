import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The website is a fully independent static build — it does not import the
// desktop app or its Tauri dependencies. It only reuses project-owned visual
// assets (copied into public/brand) and ports the hand-drawn ink motifs as
// plain inline SVG.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2020",
  },
});
