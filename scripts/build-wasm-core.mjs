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

    // Create shadow link file for WASM kernel plugin
    await createWasmKernelShadowLink();

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
    "-sFORCE_FILESYSTEM=1",
    '-sEXPORTED_FUNCTIONS=["_main"]',
    '-sEXPORTED_RUNTIME_METHODS=["FS","callMain","ccall","cwrap"]',
    "-sALLOW_MEMORY_GROWTH=1",
    "-sINITIAL_MEMORY=1MB",
    "-sSTACK_SIZE=64KB",
    "-sNO_DYNAMIC_EXECUTION=1",
    "-sMODULARIZE=1",
    "-sEXPORT_NAME=WasmCore",
    "-sINVOKE_RUN=0",
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

// Create shadow link file for WASM kernel plugin
async function createWasmKernelShadowLink() {
  try {
    console.log("Creating WASM kernel shadow links...");

    const PUBLIC_DIR = path.resolve(__dirname, "../public");
    const SHADOW_DIR = path.join(PUBLIC_DIR, "shadow");

    // Ensure shadow directories exist
    await fs.mkdir(path.join(SHADOW_DIR, "Desktop"), { recursive: true });
    await fs.mkdir(path.join(SHADOW_DIR, "Downloads"), { recursive: true }); // Create desktop shortcut for WASM kernel
    const desktopShortcut = {
      name: "WASM Kernel Demo",
      description:
        "WebAssembly kernel demonstration with POSIX I/O, PTY, and process table",
      target: "wasm-kernel",
      iconType: "plugin",
      icon: "wasm-kernel",
    };

    const desktopShortcutPath = path.join(
      SHADOW_DIR,
      "Desktop",
      "WASM Kernel Demo.json"
    );
    await fs.writeFile(
      desktopShortcutPath,
      JSON.stringify(desktopShortcut, null, 2)
    );
    console.log("✓ Created desktop shortcut:", desktopShortcutPath);

    // Create downloads shortcut for WASM files
    const downloadsShortcut = {
      name: "WASM Kernel Files",
      description: "WASM kernel binary files and documentation",
      target: "file-explorer",
      iconType: "plugin",
      icon: "file-explorer",
      path: "/wasm/",
    };

    const downloadsShortcutPath = path.join(
      SHADOW_DIR,
      "Downloads",
      "WASM Kernel Files.json"
    );
    await fs.writeFile(
      downloadsShortcutPath,
      JSON.stringify(downloadsShortcut, null, 2)
    );
    console.log("✓ Created downloads shortcut:", downloadsShortcutPath);

    console.log("✓ WASM kernel shadow shortcuts created successfully");
  } catch (error) {
    console.warn("⚠ Failed to create shadow links:", error.message);
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
