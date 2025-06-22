#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CORE_DIR = path.resolve(__dirname, "../src/core");
const DIST_DIR = path.resolve(__dirname, "../dist");

async function buildWasmCore() {
  console.log("Building minimal WASM kernel...");

  try {
    // Check if Emscripten is available
    try {
      const version = execSync("emcc --version", {
        stdio: "pipe",
        encoding: "utf8",
      });
      console.log("✓ Emscripten found:", version.split("\n")[0]);
    } catch (error) {
      console.log("⚠ Emscripten not found - skipping WASM build");
      console.log("Install Emscripten SDK from: https://emscripten.org/");
      return;
    }

    // Clean and build the WASM core
    console.log("Compiling core.wasm...");
    execSync("make clean", { cwd: CORE_DIR, stdio: "inherit" });
    execSync("make optimize", { cwd: CORE_DIR, stdio: "inherit" });

    // Check if files were created
    const wasmFile = path.join(CORE_DIR, "core.wasm");
    const jsFile = path.join(CORE_DIR, "core.js");

    try {
      await fs.access(wasmFile);
      await fs.access(jsFile);
    } catch (error) {
      throw new Error("WASM build failed - output files not found");
    }

    // Get file sizes
    const wasmStats = await fs.stat(wasmFile);
    const jsStats = await fs.stat(jsFile);

    console.log(`✓ Built core.wasm: ${(wasmStats.size / 1024).toFixed(1)}KB`);
    console.log(`✓ Built core.js: ${(jsStats.size / 1024).toFixed(1)}KB`);

    // Check gzipped size if gzip is available
    try {
      const gzipSize = execSync(`gzip -c "${wasmFile}" | wc -c`, {
        encoding: "utf8",
        shell: true,
      }).trim();
      const gzipKB = parseInt(gzipSize) / 1024;
      console.log(`✓ Gzipped size: ${gzipKB.toFixed(1)}KB`);

      if (gzipKB > 250) {
        console.log("⚠ WARNING: Size exceeds 250KB target!");
      }
    } catch (error) {
      console.log("ℹ Could not check gzipped size (gzip not available)");
    }

    // Install to dist directory
    execSync("make install", { cwd: CORE_DIR, stdio: "inherit" });

    console.log("✓ WASM kernel build completed successfully");
  } catch (error) {
    console.error("✗ WASM kernel build failed:", error.message);
    if (error.stdout) console.error("stdout:", error.stdout);
    if (error.stderr) console.error("stderr:", error.stderr);
    process.exit(1);
  }
}

// Also generate OpenAPI spec
async function generateAPI() {
  try {
    const { generateOpenAPI } = await import("./gen-openapi.mjs");
    await generateOpenAPI();
  } catch (error) {
    console.warn("⚠ Failed to generate OpenAPI spec:", error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await buildWasmCore();
  await generateAPI();
}

export { buildWasmCore };
