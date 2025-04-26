#!/usr/bin/env node

/**
 * Theme scaffolding script
 *
 * Usage:
 * node scripts/create-theme.js <theme-id> <theme-name>
 *
 * Example:
 * node scripts/create-theme.js material-dark "Material Dark"
 */

const fs = require("fs");
const path = require("path");

// Get arguments
const themeId = process.argv[2];
const themeName = process.argv[3] || themeId;

// Input validation
if (!themeId) {
  console.error("Error: Theme ID is required");
  console.log("Usage: node scripts/create-theme.js <theme-id> <theme-name>");
  process.exit(1);
}

// Validate theme ID format (alphanumeric, dash, underscore)
if (!/^[a-zA-Z0-9-_]+$/.test(themeId)) {
  console.error(
    "Error: Theme ID must only contain letters, numbers, dashes, and underscores"
  );
  process.exit(1);
}

// Create theme directory
const themesDir = path.join("public", "themes", themeId);
const themeManifestPath = path.join(themesDir, "manifest.json");
const themeCssPath = path.join(themesDir, "style.css");
const themeDecoratorPath = path.join(themesDir, "decorator.js");
const themePreviewPath = path.join(themesDir, "preview.png");

// Create the directory
if (!fs.existsSync(themesDir)) {
  fs.mkdirSync(themesDir, { recursive: true });
  console.log(`Created directory: ${themesDir}`);
} else {
  console.log(`Directory already exists: ${themesDir}`);
}

// Create manifest.json
const manifest = {
  id: themeId,
  name: themeName,
  author: "Your Name",
  version: "1.0.0",
  description: `${themeName} custom theme`,
  cssUrl: `/themes/${themeId}/style.css`,
  preview: `/themes/${themeId}/preview.png`,
  desktopBackground: "#f0f0f0",
  decoratorPath: `/themes/${themeId}/decorator.js`,
  cssVariables: {
    "--wm-border-width": "1px",
    "--wm-border-color": "#cccccc",
    "--wm-border-radius": "8px",
    "--wm-header-height": "32px",
    "--window-background": "#ffffff",
    "--window-text": "#000000",
    "--window-header-background": "#f8f8f8",
    "--window-header-text": "#333333",
    "--window-header-button-hover": "#e8e8e8",
    "--window-header-button-active": "#d8d8d8",
    "--window-resize-handle": "rgba(0, 0, 0, 0.1)",
    "--wm-btn-close-bg": "#ff5f57",
    "--wm-btn-minimize-bg": "#ffbd2e",
    "--wm-btn-maximize-bg": "#28c940",
    "--taskbar-bg": "rgba(248, 248, 248, 0.8)",
    "--text-primary": "#333333",
    "--accent-primary": "#0066cc",
  },
};

fs.writeFileSync(themeManifestPath, JSON.stringify(manifest, null, 2));
console.log(`Created manifest: ${themeManifestPath}`);

// Create CSS file
const css = `/* 
 * ${themeName} Theme
 * 
 * This file contains additional styling beyond the CSS variables
 * defined in the manifest.json file.
 */

.theme-${themeId} .window-header {
  /* Custom header styling */
}

.theme-${themeId} .window-content {
  /* Custom content styling */
}

.theme-${themeId} .taskbar {
  /* Custom taskbar styling */
}
`;

fs.writeFileSync(themeCssPath, css);
console.log(`Created CSS file: ${themeCssPath}`);

// Create decorator file
const decorator = `// ${themeName} Decorator
// This file defines custom window decorations

class ${
  themeId.charAt(0).toUpperCase() +
  themeId.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}Decorator {
  // Window header component
  static Header = ({ title, onMinimize, onMaximize, onClose, headerRef }) => {
    return React.createElement('div', { 
      ref: headerRef,
      className: '${themeId}-header window-header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 8px'
      }
    }, [
      // Title area
      React.createElement('div', { 
        className: '${themeId}-title',
        key: 'title',
        style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
      }, title),
      
      // Controls
      React.createElement('div', { 
        className: '${themeId}-controls',
        key: 'controls',
        style: { display: 'flex', gap: '8px' }
      }, [
        React.createElement('button', { 
          onClick: onMinimize,
          key: 'minimize',
          title: 'Minimize',
          style: { cursor: 'pointer' }
        }, '—'),
        React.createElement('button', { 
          onClick: onMaximize,
          key: 'maximize',
          title: 'Maximize',
          style: { cursor: 'pointer' }
        }, '□'),
        React.createElement('button', { 
          onClick: onClose,
          key: 'close',
          title: 'Close',
          style: { cursor: 'pointer' }
        }, '×')
      ])
    ]);
  };

  // Window controls component (used in other contexts)
  static Controls = ({ onMinimize, onMaximize, onClose }) => {
    return React.createElement('div', { 
      className: '${themeId}-controls',
      style: { display: 'flex', gap: '8px' }
    }, [
      React.createElement('button', { 
        onClick: onMinimize,
        key: 'minimize',
        title: 'Minimize',
        style: { cursor: 'pointer' }
      }, '—'),
      React.createElement('button', { 
        onClick: onMaximize,
        key: 'maximize',
        title: 'Maximize',
        style: { cursor: 'pointer' }
      }, '□'),
      React.createElement('button', { 
        onClick: onClose,
        key: 'close',
        title: 'Close',
        style: { cursor: 'pointer' }
      }, '×')
    ]);
  };

  // Border radius for windows
  static borderRadius = 8;
}

// Export to window object
window.${
  themeId.charAt(0).toUpperCase() +
  themeId.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}Decorator = ${
  themeId.charAt(0).toUpperCase() +
  themeId.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}Decorator;
`;

fs.writeFileSync(themeDecoratorPath, decorator);
console.log(`Created decorator file: ${themeDecoratorPath}`);

// Create an empty preview image placeholder
// This just creates an empty file - in practice, you'd want to add a real image
fs.writeFileSync(themePreviewPath, "");
console.log(`Created empty preview placeholder: ${themePreviewPath}`);

// Print final instructions
console.log(`
Theme "${themeName}" (${themeId}) scaffolding created successfully!

Next steps:
1. Customize the CSS variables in ${themeManifestPath}
2. Add additional styles in ${themeCssPath}
3. Customize the window decorations in ${themeDecoratorPath}
4. Replace ${themePreviewPath} with an actual preview image
5. Test your theme by installing it via: http://localhost:PORT/themes/${themeId}/manifest.json

For more information, see the theme authoring documentation: ./docs/THEME_AUTHORING.md
`);
