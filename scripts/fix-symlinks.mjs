#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_SHADOW_DIR = "c:/Users/mdahl/Documents/GitHub/draggable-desktop-dreamscape/dist/shadow";

async function fixSymlinks() {
  console.log("Fixing symlink issues for deployment...");

  try {
    // Remove .bin directory if it exists
    const binDirPath = path.join(DIST_SHADOW_DIR, "node_modules", ".bin");
    try {
      await fs.access(binDirPath);
      await fs.rm(binDirPath, { recursive: true, force: true });
      console.log("✓ Removed .bin directory");
    } catch {
      console.log("✓ No .bin directory found");
    }

    // Remove loose-envify cli.js if it exists
    try {
      const looseEnvifyDir = path.join(DIST_SHADOW_DIR, "node_modules", "loose-envify");
      const cliJsPath = path.join(looseEnvifyDir, "cli.js");
      
      await fs.access(cliJsPath);
      await fs.rm(cliJsPath, { force: true });
      console.log("✓ Removed loose-envify cli.js");
    } catch {
      console.log("✓ No loose-envify cli.js found");
    }

    // Check for any remaining problematic files
    const nodeModulesPath = path.join(DIST_SHADOW_DIR, "node_modules");
    try {
      const dirs = await fs.readdir(nodeModulesPath);
      console.log(`✓ Node modules present: ${dirs.join(", ")}`);
    } catch {
      console.log("✗ No node_modules directory found");
    }

    console.log("✓ Symlink fixes completed successfully");
  } catch (error) {
    console.error("✗ Failed to fix symlinks:", error);
    process.exit(1);
  }
}

fixSymlinks();
