import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api-safebooru': {
        target: 'https://safebooru.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-safebooru/, ''),
        headers: {
          'Referer': 'https://safebooru.org',
        }
      },
      '/api-jikan': {
        target: 'https://api.jikan.moe/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-jikan/, ''),
      },
      '/api-mal-images': {
        target: 'https://myanimelist.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-mal-images/, ''),
        headers: {
          'Referer': 'https://myanimelist.net',
        }
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
