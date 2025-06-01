import { componentTagger } from 'lovable-tagger';
import path from 'path';
import * as sass from 'sass';
import { defineConfig } from 'vite';
import comlink from 'vite-plugin-comlink';

import react from '@vitejs/plugin-react-swc';

import shadowFsPlugin from './vite.shadowfs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    shadowFsPlugin(),
    comlink(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@src": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
        // Use modern API
        sassOptions: {
          outputStyle: "expanded",
        },
      },
    },
  },
  base: "/prometheos/",
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  worker: {
    format: "es",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "monaco-editor": ["monaco-editor"],
        },
      },
    },
    // Copy shadow files to the output directory
    copyPublicDir: true,
  },
}));
