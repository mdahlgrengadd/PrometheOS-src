#!/usr/bin/env node

/**
 * This script builds and prepares worker plugins for production.
 * It should be run as part of the production build process.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Paths
const WORKER_SOURCE_DIR = path.resolve(__dirname, "../src/worker/plugins");
const PUBLIC_WORKERS_DIR = path.resolve(__dirname, "../public/workers");

// Ensure the destination directory exists
if (!fs.existsSync(PUBLIC_WORKERS_DIR)) {
  fs.mkdirSync(PUBLIC_WORKERS_DIR, { recursive: true });
  console.log(`Created directory: ${PUBLIC_WORKERS_DIR}`);
}

// Read all TypeScript files in the worker plugins directory
const pluginFiles = fs
  .readdirSync(WORKER_SOURCE_DIR)
  .filter((file) => file.endsWith(".ts") && !file.endsWith(".d.ts"));

console.log("Building worker plugins:");
console.log(pluginFiles);

// Process each plugin file
pluginFiles.forEach((file) => {
  const baseName = path.basename(file, ".ts");
  const outputName = `${baseName}-worker.js`;
  const sourcePath = path.join(WORKER_SOURCE_DIR, file);
  const outputPath = path.join(PUBLIC_WORKERS_DIR, outputName);

  console.log(`Building ${baseName} worker...`);

  try {
    // Use esbuild to bundle the worker file
    execSync(
      `npx esbuild ${sourcePath} --bundle --format=esm --outfile=${outputPath}`,
      {
        stdio: "inherit",
      }
    );

    console.log(`Successfully built ${outputPath}`);

    // Post-process the file if needed
    let content = fs.readFileSync(outputPath, "utf8");

    // Add a comment about this being a built file
    content = `// Built worker plugin: ${baseName}\n// Generated on: ${new Date().toISOString()}\n\n${content}`;

    fs.writeFileSync(outputPath, content);

    console.log(`Post-processed ${outputPath}`);
  } catch (error) {
    console.error(`Error building ${baseName} worker:`, error);
    process.exit(1);
  }
});

console.log("All worker plugins built successfully");
