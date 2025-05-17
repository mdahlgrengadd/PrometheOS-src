import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";
import comlink from "vite-plugin-comlink";

import react from "@vitejs/plugin-react-swc";
import * as sass from 'sass';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    comlink(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
        // Use modern API
        sassOptions: {
          outputStyle: 'expanded',
        }
      }
    }
  }
}));
