import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  base: "/", // ✅ important for vercel
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  // Use Vite defaults for chunking to avoid potential execution order issues on some hosts
  build: {},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent multiple copies of React from being bundled (helps avoid context/hook issues)
    dedupe: ["react", "react-dom"],
  },
}));
