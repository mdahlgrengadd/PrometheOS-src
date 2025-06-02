#!/usr/bin/env node

import { execSync } from "child_process";
import fg from "fast-glob";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_SHADOW_DIR = path.resolve(__dirname, "../dist/shadow");
const PUBLIC_SHADOW_DIR = path.resolve(__dirname, "../public/shadow");

// Read base URL from Vite config
let BASE_URL = '/';
try {
  const { loadConfigFromFile } = await import('vite');
  const config = await loadConfigFromFile(
    { command: 'build', mode: 'production' },
    path.resolve(__dirname, '../vite.config.ts')
  );
  if (config?.config?.base) {
    BASE_URL = config.config.base;
  }
} catch (error) {
  console.warn('Could not load base URL from vite config, using default "/":', error.message);
}

/**
 * @typedef {Object} ShadowFsItem
 * @property {string} id
 * @property {string} name
 * @property {"file" | "folder"} type
 * @property {string} contentPath
 */

/**
 * @param {string} filePath
 * @param {string} root
 * @returns {ShadowFsItem}
 */
function fileToFsItem(filePath, root) {
  const rel = path.relative(root, filePath).replace(/\\/g, "/");
  // Use the base URL from Vite config, ensuring proper path concatenation
  const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  return {
    id: rel,
    name: path.basename(filePath),
    type: "file",
    contentPath: `${baseUrl}/shadow/${rel}`,
  };
}

async function setupShadowEnvironment() {
  console.log("Setting up shadow environment...");
  console.log(`Using base URL: ${BASE_URL}`);

  try {
    // 1. Check if dist/shadow directory exists
    try {
      await fs.access(DIST_SHADOW_DIR);
      console.log("✓ dist/shadow directory exists");
    } catch {
      console.log("✗ dist/shadow directory does not exist");
      return;
    } // 2. Install npm dependencies in dist/shadow
    console.log("Installing React dependencies in dist/shadow...");
    try {
      execSync("npm install --no-bin-links", {
        cwd: DIST_SHADOW_DIR,
        stdio: "inherit",
        timeout: 120000, // 2 minutes timeout
      });
      console.log("✓ Dependencies installed successfully");
    } catch (error) {
      console.error("✗ Failed to install dependencies:", error.message);
      throw error;
    } // 2a. Remove any .bin directories that might still exist to prevent symlink issues
    const binDirPath = path.join(DIST_SHADOW_DIR, "node_modules", ".bin");
    try {
      await fs.access(binDirPath);
      await fs.rm(binDirPath, { recursive: true, force: true });
      console.log("✓ Removed .bin directory to prevent symlink issues");
    } catch {
      // .bin directory doesn't exist, which is fine
    }

    // 2b. Clean up any other potential symlink files that could cause tar issues
    try {
      // Remove any cli.js files in loose-envify that might have symlinks
      const looseEnvifyDir = path.join(
        DIST_SHADOW_DIR,
        "node_modules",
        "loose-envify"
      );
      const cliJsPath = path.join(looseEnvifyDir, "cli.js");

      try {
        await fs.access(cliJsPath);
        await fs.rm(cliJsPath, { force: true });
        console.log("✓ Removed loose-envify cli.js to prevent symlink issues");
      } catch {
        // File doesn't exist, which is fine
      }
    } catch {
      // Directory doesn't exist, which is fine
    }

    // 3. Generate updated shadow-manifest.json with all files including node_modules
    console.log("Generating shadow-manifest.json with node_modules..."); // Scan all files in dist/shadow including node_modules
    const files = await fg(["**/*"], {
      cwd: DIST_SHADOW_DIR,
      dot: true,
      onlyFiles: true,
      followSymbolicLinks: false, // Don't follow symlinks to prevent issues
      ignore: [
        // Ignore large binary files and unnecessary files
        "**/node_modules/**/*.d.ts",
        "**/node_modules/**/*.map",
        "**/node_modules/**/README.md",
        "**/node_modules/**/LICENSE*",
        "**/node_modules/**/CHANGELOG*",
        "**/node_modules/**/test/**",
        "**/node_modules/**/tests/**",
        "**/node_modules/**/__tests__/**",
        "**/node_modules/**/docs/**",
        "**/node_modules/**/examples/**",
        "**/node_modules/**/.bin/**",
        "**/node_modules/**/.bin",
        "**/node_modules/**/.github/**",
        // Additional patterns to catch symlinks and problematic files
        "**/.bin/**",
        "**/.bin",
        "**/node_modules/**/bin/**",
        "**/node_modules/**/bin",
      ],
    });

    // Filter to include only essential React files from node_modules
    const essentialFiles = files.filter((file) => {
      // Include all non-node_modules files
      if (!file.includes("node_modules/")) return true;

      // Include only essential React module files
      const isReactCore =
        file.includes("node_modules/react/") &&
        (file.endsWith("index.js") ||
          file.includes("/cjs/") ||
          file.endsWith("package.json"));

      const isReactDom =
        file.includes("node_modules/react-dom/") &&
        (file.endsWith("index.js") ||
          file.endsWith("client.js") ||
          file.includes("/cjs/") ||
          file.endsWith("package.json"));

      const isScheduler =
        file.includes("node_modules/scheduler/") &&
        (file.endsWith("index.js") ||
          file.includes("/cjs/") ||
          file.endsWith("package.json"));

      return isReactCore || isReactDom || isScheduler;
    });

    console.log(
      `Found ${essentialFiles.length} essential files (${files.length} total files scanned)`
    );

    // Build manifest items
    const items = essentialFiles.map((file) =>
      fileToFsItem(path.join(DIST_SHADOW_DIR, file), DIST_SHADOW_DIR)
    ); // Write shadow-manifest.json to dist/
    const manifestPath = path.resolve(
      __dirname,
      "../dist/shadow-manifest.json"
    );
    await fs.writeFile(manifestPath, JSON.stringify(items, null, 2));

    // Create .nojekyll file to ensure GitHub Pages serves all files
    const nojekyllPath = path.resolve(__dirname, "../dist/.nojekyll");
    await fs.writeFile(nojekyllPath, "");

    console.log(`✓ Generated shadow-manifest.json with ${items.length} files`);
    console.log(`✓ Manifest saved to: ${manifestPath}`);
    console.log(`✓ Created .nojekyll file for GitHub Pages`);

    // Log some essential files to verify
    const reactFiles = items.filter((item) =>
      item.contentPath.includes("react")
    );
    console.log(`✓ Included ${reactFiles.length} React-related files:`);
    reactFiles
      .slice(0, 10)
      .forEach((item) => console.log(`  - ${item.contentPath}`));
    if (reactFiles.length > 10) {
      console.log(`  ... and ${reactFiles.length - 10} more`);
    }
  } catch (error) {
    console.error("Failed to setup shadow environment:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  setupShadowEnvironment();
}

export { setupShadowEnvironment };
