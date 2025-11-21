import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.md"],
  // Environment variables (can be overridden by .env file)
  define: {
    'import.meta.env.VITE_PADDLE_OCR_URL': JSON.stringify(
      process.env.VITE_PADDLE_OCR_URL || 'http://localhost:9000/recognize'
    ),
  },
}));
