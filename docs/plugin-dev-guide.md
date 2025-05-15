# Plugin Development Guide

This guide explains how to create third-party plugins for the Desktop Dreamscape environment.

## Plugin Architecture

Plugins in Desktop Dreamscape are JavaScript/TypeScript modules that follow a specific structure. They can be loaded both at build-time (for built-in plugins) and runtime (for third-party plugins).

## Creating a Plugin

### Plugin Manifest

Every plugin needs a manifest file that describes the plugin. Here's the structure:

```typescript
export interface PluginManifest {
  id: string;           // Unique identifier for the plugin
  name: string;         // Display name
  version: string;      // Semantic version (e.g., "1.0.0")
  description: string;  // Brief description
  author: string;       // Author/organization name
  icon: React.ReactNode; // Icon for the plugin (React component) - for built-in plugins
  iconUrl?: string;     // URL to icon image - for remote plugins
  entry: string;        // Entry point (relative to the plugin directory)
  entrypoint?: string;  // URL for dynamically loaded plugin (used for remote plugins)
  preferredSize?: {     // Default window size
    width: number;
    height: number;
  };
}
```

### Plugin Interface

Your plugin must implement the `Plugin` interface:

```typescript
export interface Plugin {
  id: string;                       // Must match the manifest id
  manifest: PluginManifest;         // Reference to the plugin manifest
  init: () => Promise<void> | void; // Initialization function (async or sync)
  render: () => React.ReactNode;    // Main UI rendering function
  onOpen?: () => void;              // Called when the plugin window is opened
  onClose?: () => void;             // Called when the plugin window is closed
  onMinimize?: () => void;          // Called when the window is minimized
  onMaximize?: () => void;          // Called when the window is maximized
  onDestroy?: () => void;           // Called when the plugin is unloaded
}
```

## Creating a Remote (Third-party) Plugin

For third-party plugins that can be installed at runtime:

1. Create a JavaScript/TypeScript module that exports a default object implementing the `Plugin` interface
2. Build your plugin as a standalone module with the appropriate exports
3. Host your plugin files on a web server or CDN
4. Create a plugin manifest JSON file that points to your plugin entrypoint

### Sample Plugin Structure

```
my-plugin/
├── dist/
│   ├── plugin.js       # Your compiled plugin code
│   └── manifest.json   # Manifest file
```

### Sample manifest.json

```json
{
  "id": "my-awesome-plugin",
  "name": "My Awesome Plugin",
  "version": "1.0.0",
  "description": "This plugin does awesome things",
  "author": "Your Name",
  "iconUrl": "https://example.com/my-plugin/icon.png",
  "entrypoint": "https://example.com/my-plugin/dist/plugin.js",
  "preferredSize": {
    "width": 600,
    "height": 400
  }
}
```

> **IMPORTANT**: For third-party plugins, use `iconUrl` instead of `icon` in your manifest. The `icon` property is for built-in plugins only as it requires a React component that can't be serialized in JSON.

### Sample Plugin Implementation

```typescript
import React from 'react';

// Your plugin implementation
const MyPlugin = {
  id: "my-awesome-plugin",
  manifest: {
    id: "my-awesome-plugin",
    name: "My Awesome Plugin",
    version: "1.0.0",
    description: "This plugin does awesome things",
    author: "Your Name",
    iconUrl: "https://example.com/my-plugin/icon.png",
    entry: "",
    entrypoint: "https://example.com/my-plugin/dist/plugin.js",
    preferredSize: {
      width: 600,
      height: 400
    }
  },
  init: async () => {
    console.log("My plugin initialized!");
  },
  render: () => {
    return (
      <div style={{ padding: '20px' }}>
        <h2>My Awesome Plugin</h2>
        <p>This is a third-party plugin!</p>
      </div>
    );
  },
  onOpen: () => {
    console.log("Plugin window opened");
  },
  onClose: () => {
    console.log("Plugin window closed");
  }
};

export default MyPlugin;
```

## Building Your Plugin

To build your plugin for distribution:

1. Set up a simple Vite/Webpack/Rollup project
2. Configure it to build your plugin as an ES module
3. Make sure to externalize React and other core dependencies
4. Build your plugin
5. Create the manifest.json file
6. Host both files on a server or CDN

### CORS Requirements

Since your plugin will be loaded at runtime via a dynamic import, your server must provide the appropriate CORS headers:

```
Access-Control-Allow-Origin: * (or your specific domain)
Content-Type: application/javascript
```

Without these headers, the browser will block loading your plugin due to security restrictions.

### Sample Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.tsx',
      formats: ['es'],
      fileName: 'plugin'
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
```

## Installation

To install your plugin:

1. Host your plugin files (JS module + manifest) on a public server
2. In Desktop Dreamscape, go to Settings > Plugins
3. Click "Install from URL"
4. Enter the URL to your manifest.json file
5. Click "Install Plugin"

## Best Practices

1. Keep plugin sizes small for faster loading
2. Properly handle errors and cleanup in lifecycle methods
3. Test your plugin thoroughly before publishing
4. Provide clear documentation for users
5. Use semantic versioning for updates
6. Ensure unique plugin IDs to avoid conflicts with built-in plugins

## Security Considerations

Remote plugins run with the same privileges as the main application. Users are advised to only install plugins from trusted sources.

## Debugging

To debug your plugin:

1. Open browser developer tools
2. Check the console for errors
3. You can use `console.log` statements in your plugin code for debugging

## API Access

Plugins can access the Desktop Dreamscape API through context providers. Documentation for the available APIs will be expanded in future updates.

## Support and Community

For questions, feedback, or to share your plugins with the community, please join our [Discord server](https://example.com/discord) or visit the [plugin showcase](https://example.com/plugins) on our website. 