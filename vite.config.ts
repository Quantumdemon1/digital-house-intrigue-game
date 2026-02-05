import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent duplicate React/Three.js instances that cause "Cannot read properties of undefined" errors
    dedupe: [
      "react", 
      "react-dom", 
      "react/jsx-runtime", 
      "three", 
      "@react-three/fiber", 
      "@react-three/drei",
      "three-stdlib",
      "@react-three/postprocessing",
      "postprocessing"
    ],
  },
  optimizeDeps: {
    // Force these packages to be pre-bundled together to avoid duplicate instances
    include: [
      "react",
      "react-dom",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "three-stdlib",
      "@react-three/postprocessing",
      "postprocessing"
    ],
    // Force rebuild of optimized deps cache to clear any corrupted instances
    force: true,
  },
}));
