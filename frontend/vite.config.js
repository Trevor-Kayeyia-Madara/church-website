import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "..");
const frontendRoot = path.resolve(__dirname);

export default defineConfig({
  plugins: [
    // Many files are `.js` but contain JSX (migrated from Next.js).
    // Ensure the React plugin transforms BOTH `.js` and `.jsx`.
    react({ include: [/\.jsx?$/] }),
  ],
  optimizeDeps: {
    // Dependency pre-bundling may encounter JSX in `.js` as well.
    esbuildOptions: { loader: { ".js": "jsx" } },
  },
  define: {
    "process.env.NEXT_PUBLIC_LIVE_EMBED_URL": JSON.stringify(process.env.NEXT_PUBLIC_LIVE_EMBED_URL || ""),
    "process.env.NEXT_PUBLIC_SITE_URL": JSON.stringify(process.env.NEXT_PUBLIC_SITE_URL || ""),
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(frontendRoot, "src") },
      { find: "next/link", replacement: path.resolve(__dirname, "src/shims/next-link.jsx") },
      { find: "next/image", replacement: path.resolve(__dirname, "src/shims/next-image.jsx") },
      { find: "next/navigation", replacement: path.resolve(__dirname, "src/shims/next-navigation.jsx") },
      { find: "next/server", replacement: path.resolve(__dirname, "src/shims/next-server.jsx") },
    ],
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
    fs: { allow: [frontendRoot] },
  },
});
