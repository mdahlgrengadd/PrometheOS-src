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
const PLUGINS_DIR = path.resolve(__dirname, "../src/plugins/apps");
const PUBLIC_WORKERS_DIR = path.resolve(__dirname, "../public/worker");

// Ensure the destination directory exists
if (!fs.existsSync(PUBLIC_WORKERS_DIR)) {
  fs.mkdirSync(PUBLIC_WORKERS_DIR, { recursive: true });
  console.log(`Created directory: ${PUBLIC_WORKERS_DIR}`);
}

// Find worker plugins to build
const workerFiles = [];

// 1. Look in the dedicated worker plugins directory
if (fs.existsSync(WORKER_SOURCE_DIR)) {
  const allowedExtensions = [".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs"];
  const dedicatedWorkerFiles = fs
    .readdirSync(WORKER_SOURCE_DIR)
    .filter(
      (file) =>
        allowedExtensions.some((ext) => file.endsWith(ext)) &&
        !file.endsWith(".d.ts")
    )
    .map((file) => ({
      pluginId: path.basename(file, path.extname(file)),
      sourcePath: path.join(WORKER_SOURCE_DIR, file),
    }));

  workerFiles.push(...dedicatedWorkerFiles);
}

// 2. Look for workerEntrypoints in plugin manifests
if (fs.existsSync(PLUGINS_DIR)) {
  const pluginDirs = fs.readdirSync(PLUGINS_DIR);

  pluginDirs.forEach((pluginDir) => {
    const fullPluginDir = path.join(PLUGINS_DIR, pluginDir);

    // Skip if not a directory
    if (!fs.statSync(fullPluginDir).isDirectory()) {
      return;
    }

    // Check if this plugin has a manifest with workerEntrypoint
    const manifestPath = path.join(fullPluginDir, "manifest.ts");
    if (fs.existsSync(manifestPath)) {
      const manifestContent = fs.readFileSync(manifestPath, "utf8");
      const workerEntrypointMatch = manifestContent.match(
        /workerEntrypoint: ["']([^"']+)["']/
      );

      if (workerEntrypointMatch) {
        // Plugin has a worker, check if it exists in the dedicated worker directory
        // If not, look for it in the plugin directory

        // If the plugin already has a worker in the dedicated worker directory,
        // we've already added it above, so skip it
        const dedicatedWorkerPath = path.join(
          WORKER_SOURCE_DIR,
          `${pluginDir}.ts`
        );
        if (!fs.existsSync(dedicatedWorkerPath)) {
          // Look for worker.ts in the plugin directory
          const pluginWorkerPath = path.join(fullPluginDir, "worker.ts");
          if (fs.existsSync(pluginWorkerPath)) {
            workerFiles.push({
              pluginId: pluginDir,
              sourcePath: pluginWorkerPath,
            });
          }
        }
      }
    }
  });
}

console.log("Building worker plugins:");
console.log(workerFiles.map((file) => file.pluginId));

// Copy Python files for pyodide plugin if it exists
const pyodidePluginDir = path.join(WORKER_SOURCE_DIR, "pyodide");
if (fs.existsSync(pyodidePluginDir)) {
  const pythonDir = path.join(pyodidePluginDir, "python");
  if (fs.existsSync(pythonDir)) {
    const publicPythonDir = path.join(PUBLIC_WORKERS_DIR, "pyodide", "python");

    // Ensure the directory exists
    if (!fs.existsSync(publicPythonDir)) {
      fs.mkdirSync(publicPythonDir, { recursive: true });
      console.log(`Created directory: ${publicPythonDir}`);
    }
    // Copy all Python files
    const pythonFiles = fs
      .readdirSync(pythonDir)
      .filter((file) => file.endsWith(".py"));
    const pythonBundle = {};

    pythonFiles.forEach((file) => {
      const sourcePath = path.join(pythonDir, file);
      const destPath = path.join(publicPythonDir, file);

      // Copy individual files
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied Python file: ${file}`);

      // Also add to bundle for fallback
      const content = fs.readFileSync(sourcePath, "utf8");
      pythonBundle[file] = content;
    });

    // Create a Python bundle file as fallback
    const bundlePath = path.join(
      PUBLIC_WORKERS_DIR,
      "pyodide-python-bundle.json"
    );
    fs.writeFileSync(bundlePath, JSON.stringify(pythonBundle, null, 2));
    console.log(`Created Python bundle: pyodide-python-bundle.json`);

    console.log(`Copied ${pythonFiles.length} Python files for pyodide plugin`);
  }
}

// Process each plugin file
workerFiles.forEach(({ pluginId, sourcePath }) => {
  const outputName = `${pluginId}.js`;
  const outputPath = path.join(PUBLIC_WORKERS_DIR, outputName);

  const isProduction = process.argv.includes("--production");
  console.log(
    `Building ${pluginId} worker${
      isProduction
        ? " (production - console removal enabled)"
        : " (development)"
    }...`
  );
  try {
    // Use esbuild to bundle and minify the worker file with console removal in production
    const isProduction = process.argv.includes("--production");
    //const dropOptions = isProduction ? "--drop:console --drop:debugger" : "";
    const dropOptions = isProduction ? "--drop:debugger" : "";

    execSync(
      `npx esbuild ${sourcePath} --bundle --format=esm --minify ${dropOptions} --outfile=${outputPath}`,
      {
        stdio: "inherit",
      }
    );

    console.log(`Successfully built ${outputPath}`);

    // Post-process the file if needed
    let content = fs.readFileSync(outputPath, "utf8");

    // Add a comment about this being a built file
    content = `// Built worker plugin: ${pluginId}\n// Generated on: ${new Date().toISOString()}\n\n${content}`;

    fs.writeFileSync(outputPath, content);

    console.log(`Post-processed ${outputPath}`);
  } catch (error) {
    console.error(`Error building ${pluginId} worker:`, error);
    process.exit(1);
  }
});

console.log("All worker plugins built successfully");
