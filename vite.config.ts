import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "/", // very important for Vercel
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-query"],
    force: true, // 🔥 force single instance
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ["react", "react-dom"], // prevent rebundling
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
});
