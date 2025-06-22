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
      console.log("For Windows: Download and run emsdk-main.zip, then:");
      console.log("  emsdk install latest");
      console.log("  emsdk activate latest");
      console.log("  emsdk_env.bat");
      return;
    }
    // Clean previous build (only if older than 5 minutes)
    console.log("Checking previous build...");
    const filesToClean = [
      "core.wasm",
      "core.js",
      "main.o",
      "fs.o",
      "pty.o",
      "bus.o",
      "proc.o",
    ];
    const cleanOlderThan = Date.now() - 5 * 60 * 1000; // 5 minutes

    for (const file of filesToClean) {
      try {
        const filePath = path.join(CORE_DIR, file);
        const stats = await fs.stat(filePath);
        if (stats.mtime.getTime() < cleanOlderThan) {
          await fs.unlink(filePath);
          console.log(`Cleaned old file: ${file}`);
        } else {
          console.log(`Keeping recent file: ${file}`);
        }
      } catch (error) {
        // File doesn't exist, ignore
      }
    } // Build using manual build (more reliable than batch script)
    console.log("Compiling core.wasm...");
    await manualBuild();

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
    console.log(`✓ Built core.js: ${(jsStats.size / 1024).toFixed(1)}KB`); // Install to public directory for static serving
    const PUBLIC_DIR = path.resolve(__dirname, "../public");
    await fs.mkdir(path.join(PUBLIC_DIR, "wasm"), { recursive: true });
    await fs.copyFile(wasmFile, path.join(PUBLIC_DIR, "wasm", "core.wasm"));
    await fs.copyFile(jsFile, path.join(PUBLIC_DIR, "wasm", "core.js"));

    console.log("✓ Installed to public/wasm/");
    console.log("✓ WASM kernel build completed successfully");
  } catch (error) {
    console.error("✗ WASM kernel build failed:", error.message);
    console.error("Make sure Emscripten SDK is installed and activated");
    process.exit(1);
  }
}

// Manual build fallback
async function manualBuild() {
  const CFLAGS = ["-O3", "-flto", "-DNDEBUG", "-Wall", "-Wextra", "-I."];
  const LDFLAGS = [
    "-sWASMFS=1",
    '-sEXPORTED_FUNCTIONS=["_main"]',
    '-sEXPORTED_RUNTIME_METHODS=["FS","callMain"]',
    "-sALLOW_MEMORY_GROWTH=1",
    "-sINITIAL_MEMORY=1MB",
    "-sSTACK_SIZE=64KB",
    "-sNO_DYNAMIC_EXECUTION=1",
    "-sMODULARIZE=1",
    "-sEXPORT_NAME=WasmCore",
    "-sASYNCIFY=1",
    "-flto",
  ];

  const sources = ["main.c", "fs.c", "pty.c", "bus.c", "proc.c"];

  console.log("Manual build: compiling objects...");
  for (const src of sources) {
    const obj = src.replace(".c", ".o");
    execSync(`emcc ${CFLAGS.join(" ")} -c ${src} -o ${obj}`, {
      cwd: CORE_DIR,
      stdio: "inherit",
    });
  }

  console.log("Manual build: linking...");
  const objects = sources.map((s) => s.replace(".c", ".o")).join(" ");
  execSync(`emcc ${objects} -o core.js ${LDFLAGS.join(" ")}`, {
    cwd: CORE_DIR,
    stdio: "inherit",
  });
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
console.log("Script started...");

// Fix for Windows path handling
const isMainModule =
  import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}` ||
  path.resolve(fileURLToPath(import.meta.url)) ===
    path.resolve(process.argv[1]);

if (isMainModule) {
  console.log("Running buildWasmCore...");
  await buildWasmCore();
  await generateAPI();
} else {
  console.log("Script was imported, not executed directly");
}

export { buildWasmCore };
