#!/usr/bin/env node

/**
 * Build Python wheel package for PrometheOS Python client
 * This script builds a .whl file from the Python package and copies it to public/wheels/
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.join(__dirname, "..", "public", "python-modules");
const wheelsDir = path.join(__dirname, "..", "public", "wheels");
const distDir = path.join(packageDir, "dist");

console.log("🔨 Building PrometheOS Python wheel package...");

// Check if Python package exists
if (!fs.existsSync(packageDir)) {
  console.error(
    "❌ Python package not found. Run 'npm run create-python-package' first."
  );
  process.exit(1);
}

// Check if setup.py exists
const setupPyPath = path.join(packageDir, "setup.py");
if (!fs.existsSync(setupPyPath)) {
  console.error("❌ setup.py not found in Python package directory.");
  process.exit(1);
}

// Ensure wheels directory exists
if (!fs.existsSync(wheelsDir)) {
  fs.mkdirSync(wheelsDir, { recursive: true });
  console.log("✅ Created wheels directory");
}

// Clean previous builds
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
  console.log("✅ Cleaned previous build artifacts");
}

try {
  // Build the wheel
  console.log("🏗️  Building wheel package...");
  const buildCommand =
    process.platform === "win32"
      ? "python setup.py bdist_wheel"
      : "python3 setup.py bdist_wheel";

  execSync(buildCommand, {
    cwd: packageDir,
    stdio: "inherit",
  });

  // Find the generated wheel file
  const distFiles = fs.readdirSync(distDir);
  const wheelFile = distFiles.find((file) => file.endsWith(".whl"));

  if (!wheelFile) {
    console.error("❌ No wheel file generated");
    process.exit(1);
  }

  // Copy wheel to public/wheels directory
  const sourcePath = path.join(distDir, wheelFile);
  const targetPath = path.join(wheelsDir, wheelFile);

  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✅ Copied ${wheelFile} to public/wheels/`);

  // Clean up build artifacts (optional)
  const buildDir = path.join(packageDir, "build");
  const eggInfoDir = path.join(packageDir, "prometheos.egg-info");

  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
  }
  if (fs.existsSync(eggInfoDir)) {
    fs.rmSync(eggInfoDir, { recursive: true, force: true });
  }
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  console.log("✅ Cleaned build artifacts");
  console.log("");
  console.log("🎉 Python wheel built successfully!");
  console.log(`📦 Wheel package: ${wheelFile}`);
  console.log(`📍 Location: public/wheels/${wheelFile}`);
  console.log("");
  console.log("💡 Test installation in Pyodide:");
  console.log("   import micropip");
  console.log(
    `   await micropip.install("http://localhost:8080/prometheos/wheels/${wheelFile}")`
  );
  console.log("   import prometheos");
  console.log('   await prometheos.launcher.notify("Hello from Python!")');
} catch (error) {
  console.error("❌ Failed to build wheel:", error.message);
  console.log("");
  console.log("💡 Make sure Python is installed and available in PATH:");
  console.log("   - Windows: python --version");
  console.log("   - macOS/Linux: python3 --version");
  console.log("");
  console.log("   If Python is not installed, install it from:");
  console.log("   https://www.python.org/downloads/");
  process.exit(1);
}
