#!/usr/bin/env node

/**
 * Create PrometheOS Python package for micropip installation
 * This creates a proper Python package structure that micropip can install
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, "..", "src", "prometheos-client-python");
const generatedSourceDir = path.join(
  __dirname,
  "..",
  "src",
  "prometheos-client-python-generated"
);
const targetDir = path.join(__dirname, "..", "public", "python-modules");

console.log("🐍 Creating PrometheOS Python package for micropip...");

// Clean and recreate target directory more carefully
if (fs.existsSync(targetDir)) {
  try {
    // Try to remove specific subdirectories instead of the whole directory
    const entries = fs.readdirSync(targetDir);
    for (const entry of entries) {
      const entryPath = path.join(targetDir, entry);
      const stat = fs.statSync(entryPath);
      if (
        stat.isDirectory() &&
        entry !== "dist" &&
        entry !== ".." &&
        entry !== "."
      ) {
        try {
          fs.rmSync(entryPath, { recursive: true, force: true });
          console.log(`✅ Removed ${entry}`);
        } catch (err) {
          console.warn(`⚠️  Could not remove ${entry}: ${err.message}`);
        }
      } else if (stat.isFile()) {
        try {
          fs.unlinkSync(entryPath);
          console.log(`✅ Removed file ${entry}`);
        } catch (err) {
          console.warn(`⚠️  Could not remove file ${entry}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    console.warn(`⚠️  Could not clean target directory: ${err.message}`);
  }
} else {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Create prometheos package directory
const packageDir = path.join(targetDir, "prometheos");
if (!fs.existsSync(packageDir)) {
  fs.mkdirSync(packageDir, { recursive: true });
}

// Create package __init__.py from the main client
const mainClientPath = path.join(sourceDir, "prometheos_client.py");
if (fs.existsSync(mainClientPath)) {
  let content = fs.readFileSync(mainClientPath, "utf8");

  // Update imports for package structure
  content = content.replace(
    /from \.\.prometheos_client_python_generated import \*/g,
    "from .generated import *"
  );
  content = content.replace(
    /from prometheos_client_python_generated import \*/g,
    "from .generated import *"
  );

  fs.writeFileSync(path.join(packageDir, "__init__.py"), content);
  console.log("✅ Created prometheos/__init__.py");
}

// Copy generated client as prometheos/generated/
const generatedClientDir = path.join(generatedSourceDir, "prometheos_client");
if (fs.existsSync(generatedClientDir)) {
  const generatedTargetDir = path.join(packageDir, "generated");

  function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const files = fs.readdirSync(src);
      files.forEach((file) => {
        // Skip unnecessary directories
        if (
          [".git", ".github", "__pycache__", "test", "tests", "docs"].includes(
            file
          )
        ) {
          return;
        }
        copyRecursive(path.join(src, file), path.join(dest, file));
      });
    } else if (src.endsWith(".py") || path.basename(src) === "py.typed") {
      fs.copyFileSync(src, dest);
    }
  }

  copyRecursive(generatedClientDir, generatedTargetDir);
  console.log("✅ Created prometheos/generated/");
}

// Create examples module
const examplePath = path.join(sourceDir, "example_usage.py");
if (fs.existsSync(examplePath)) {
  fs.copyFileSync(examplePath, path.join(packageDir, "examples.py"));
  console.log("✅ Created prometheos/examples.py");
}

// Create setup.py
const setupPy = `from setuptools import setup, find_packages

setup(
    name="prometheos",
    version="1.0.0",
    description="PrometheOS Python Client - Desktop API bridge for Pyodide",
    author="PrometheOS Team",
    packages=find_packages(),
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3",
    ],
)`;

fs.writeFileSync(path.join(targetDir, "setup.py"), setupPy);
console.log("✅ Created setup.py");

// Create pyproject.toml
const pyprojectToml = `[build-system]
requires = ["setuptools>=45", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "prometheos"
version = "1.0.0"
description = "PrometheOS Python Client - Desktop API bridge for Pyodide"
authors = [{name = "PrometheOS Team"}]
requires-python = ">=3.8"
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "Programming Language :: Python :: 3",
]`;

fs.writeFileSync(path.join(targetDir, "pyproject.toml"), pyprojectToml);
console.log("✅ Created pyproject.toml");

// Create README.md
const readme = `# PrometheOS Python Client

A Python client library for interacting with the PrometheOS desktop environment through Pyodide.

## Installation

\`\`\`python
import micropip
await micropip.install('/prometheos/python-modules/')
import prometheos
\`\`\`

## Usage

\`\`\`python
# Simple usage
await prometheos.launcher.notify("Hello from Python!")
await prometheos.launcher.launch_app("calculator")

# Dialog interaction
result = await prometheos.dialog.open_dialog(
    title="Python App",
    description="Hello from Python!",
    confirm_label="OK"
)
\`\`\``;

fs.writeFileSync(path.join(targetDir, "README.md"), readme);
console.log("✅ Created README.md");

console.log("🎉 PrometheOS Python package created successfully!");
console.log("📦 Package structure:");
console.log("   prometheos/");
console.log("   ├── __init__.py      # Main client code");
console.log("   ├── generated/       # Generated API client");
console.log("   └── examples.py      # Usage examples");
console.log("");
console.log("💡 Usage in Pyodide:");
console.log("   import micropip");
console.log('   await micropip.install("/prometheos/python-modules/")');
console.log("   import prometheos");
console.log('   await prometheos.launcher.notify("Hello!")');
