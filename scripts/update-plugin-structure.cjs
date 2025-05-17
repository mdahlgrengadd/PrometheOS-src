#!/usr/bin/env node

/**
 * This script updates plugin structures to the new format:
 * - Creates manifest.ts, ui.tsx, and worker.ts (if needed) for each plugin
 * - Moves existing code into the appropriate files
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Paths
const PLUGINS_DIR = path.resolve(__dirname, "../src/plugins/apps");
const TEMPLATES_DIR = path.resolve(__dirname, "./templates");
const WORKER_SRC_DIR = path.resolve(__dirname, "../src/worker/plugins");

// Read all plugin directories
const pluginDirs = fs.readdirSync(PLUGINS_DIR);

console.log("Updating plugin structures:");
console.log(pluginDirs);

// Process each plugin
pluginDirs.forEach((pluginId) => {
  const pluginDir = path.join(PLUGINS_DIR, pluginId);

  // Skip if not a directory
  if (!fs.statSync(pluginDir).isDirectory()) {
    return;
  }

  console.log(`Processing plugin: ${pluginId}`);

  // Check if this plugin already has a worker implementation
  const hasWorker = fs.existsSync(path.join(WORKER_SRC_DIR, `${pluginId}.ts`));

  // Create manifest.ts if it doesn't exist
  const manifestPath = path.join(pluginDir, "manifest.tsx");
  if (!fs.existsSync(manifestPath)) {
    console.log(`Creating manifest.tsx for ${pluginId}`);

    // Read the template
    let template = fs.readFileSync(
      path.join(TEMPLATES_DIR, "manifest.tsx.template"),
      "utf8"
    );

    // Find existing plugin info from index.tsx
    let pluginName = pluginId.charAt(0).toUpperCase() + pluginId.slice(1);
    let description = `${pluginName} plugin`;
    let existingIcon = null;
    let preferredSize = null;

    const indexPath = path.join(pluginDir, "index.tsx");
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, "utf8");

      // Try to extract information
      const manifestMatch = indexContent.match(
        /export const manifest[^{]+{([^}]+)}/s
      );
      if (manifestMatch) {
        const manifestContent = manifestMatch[1];

        // Extract name
        const nameMatch = manifestContent.match(/name: ["']([^"']+)["']/);
        if (nameMatch) pluginName = nameMatch[1];

        // Extract description
        const descMatch = manifestContent.match(
          /description: ["']([^"']+)["']/
        );
        if (descMatch) description = descMatch[1];

        // Try to extract icon
        const iconMatch = manifestContent.match(/icon: \([^)]+\)/s);
        if (iconMatch) existingIcon = iconMatch[0];

        // Try to extract preferredSize
        const sizeMatch = manifestContent.match(/preferredSize: {([^}]+)}/s);
        if (sizeMatch) preferredSize = sizeMatch[0];
      }
    }

    // Replace placeholders
    template = template.replace(/PLUGIN_ID/g, pluginId);
    template = template.replace(/PLUGIN_NAME/g, pluginName);
    template = template.replace(/PLUGIN_DESCRIPTION/g, description);

    // Replace icon if found
    if (existingIcon) {
      template = template.replace(/icon: \([^)]+\)/s, existingIcon);
    }

    // Replace preferredSize if found
    if (preferredSize) {
      template = template.replace(/preferredSize: {[^}]+}/s, preferredSize);
    }

    // Uncomment workerEntrypoint if hasWorker
    if (hasWorker) {
      template = template.replace(
        /\/\/ workerEntrypoint: "PLUGIN_ID.js"/,
        `workerEntrypoint: "${pluginId}.js"`
      );
    }

    fs.writeFileSync(manifestPath, template);
  }

  // Move main component to ui.tsx
  const uiPath = path.join(pluginDir, "ui.tsx");
  if (!fs.existsSync(uiPath)) {
    console.log(`Creating ui.tsx for ${pluginId}`);

    // Look for a content file (commonly named *Content.tsx)
    const files = fs.readdirSync(pluginDir);
    const contentFile = files.find(
      (file) => file.toLowerCase().includes("content") && file.endsWith(".tsx")
    );

    if (contentFile) {
      // Copy the content file to ui.tsx
      fs.copyFileSync(path.join(pluginDir, contentFile), uiPath);
      console.log(`Copied ${contentFile} to ui.tsx`);
    } else {
      // Create a new ui.tsx from template
      let template = fs.readFileSync(
        path.join(TEMPLATES_DIR, "ui.tsx.template"),
        "utf8"
      );

      // Replace placeholders
      const pluginName = pluginId.charAt(0).toUpperCase() + pluginId.slice(1);
      template = template.replace(/PLUGIN_ID/g, pluginId);
      template = template.replace(/PLUGIN_NAME/g, pluginName);

      fs.writeFileSync(uiPath, template);
    }
  }

  // Create worker.ts placeholder if no worker exists
  if (!hasWorker) {
    const workerSrcPath = path.join(WORKER_SRC_DIR, `${pluginId}.ts`);
    if (!fs.existsSync(workerSrcPath)) {
      console.log(`Creating worker.ts placeholder for ${pluginId}`);

      // Create worker directory if it doesn't exist
      if (!fs.existsSync(WORKER_SRC_DIR)) {
        fs.mkdirSync(WORKER_SRC_DIR, { recursive: true });
      }

      // Read the template
      let template = fs.readFileSync(
        path.join(TEMPLATES_DIR, "worker.ts.template"),
        "utf8"
      );

      // Replace placeholders
      const pluginName = pluginId.charAt(0).toUpperCase() + pluginId.slice(1);
      template = template.replace(/PLUGIN_ID/g, pluginId);
      template = template.replace(/PLUGIN_NAME/g, pluginName);

      fs.writeFileSync(workerSrcPath, template);
    }
  }

  // Update the index.tsx file
  const indexPath = path.join(pluginDir, "index.tsx");
  console.log(`Updating index.tsx for ${pluginId}`);

  // Read the template
  let template = fs.readFileSync(
    path.join(TEMPLATES_DIR, "index.tsx.template"),
    "utf8"
  );

  // Replace placeholders
  const pluginName = pluginId.charAt(0).toUpperCase() + pluginId.slice(1);
  template = template.replace(/PLUGIN_ID/g, pluginId);
  template = template.replace(/PLUGIN_NAME/g, pluginName);

  // Save the new index if it doesn't exist yet
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, template);
  } else {
    console.log(
      `Index.tsx already exists for ${pluginId}, checking for updates...`
    );

    // Read current index.tsx
    const indexContent = fs.readFileSync(indexPath, "utf8");

    // Check if it has a manifest declaration and doesn't import from manifest.tsx
    if (
      indexContent.match(/export const manifest[^{]+{/s) &&
      !indexContent.match(
        /import\s+{\s*manifest\s*}\s+from\s+['"]\.\/manifest['"]/
      )
    ) {
      console.log(`Updating index.tsx to import manifest from manifest.tsx`);

      // Remove manifest declaration and add import
      let updatedContent = indexContent
        .replace(
          /import\s+{\s*Plugin,\s*PluginManifest\s*}\s+from\s+['"][^'"]+['"]/g,
          `import { Plugin } from '../../types'`
        )
        .replace(
          /export const manifest[\s\S]*?};/s,
          `import { manifest } from './manifest';`
        );

      fs.writeFileSync(indexPath, updatedContent);
    } else {
      console.log(`Index.tsx for ${pluginId} already updated, skipping.`);
    }
  }
});

console.log("Plugin structure update complete!");
