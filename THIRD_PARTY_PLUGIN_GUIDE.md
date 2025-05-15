# Desktop Dreamscape - Third-Party Plugin Developer Guide

This guide walks you through creating plugins for Desktop Dreamscape that can be installed at runtime via the Settings panel.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Plugin Architecture](#plugin-architecture)
3. [Step-by-Step Tutorial](#step-by-step-tutorial)
4. [Hosting Requirements](#hosting-requirements)
5. [Installation Process](#installation-process)
6. [API Reference](#api-reference)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Quick Start

For the impatient, here's how to create and distribute a plugin:

1. Create a TypeScript/React project with Vite
2. Export a default object implementing the `Plugin` interface
3. Build as an ES module
4. Create a `manifest.json` file
5. Host both files on a server with CORS enabled
6. Users install via Settings → Plugins → Install from URL

## Plugin Architecture

Plugins in Desktop Dreamscape consist of two parts:

1. **A manifest file** (`manifest.json`) - Contains metadata and URLs
2. **A JavaScript module** (`plugin.js`) - Contains the plugin implementation

### Manifest Schema

```json
{
  "id": "my-awesome-plugin",
  "name": "My Awesome Plugin",
  "version": "1.0.0",
  "description": "Does something amazing",
  "author": "Your Name",
  "iconUrl": "https://example.com/icon.png",
  "entrypoint": "https://example.com/plugin.js",
  "preferredSize": {
    "width": 800,
    "height": 600
  }
}
```

> **IMPORTANT**: Use `iconUrl` instead of `icon` for third-party plugins, as the icon property requires a React component that can't be serialized in JSON.

### Plugin Interface

Your module must export a default object implementing:

```typescript
interface Plugin {
  id: string;                       // Must match manifest.id
  manifest: PluginManifest;         // Reference to manifest
  init: () => Promise<void> | void; // Called on load
  render: () => React.ReactNode;    // UI rendering
  onOpen?: () => void;              // Window opened
  onClose?: () => void;             // Window closed
  onMinimize?: () => void;          // Window minimized
  onMaximize?: () => void;          // Window maximized
  onDestroy?: () => void;           // Plugin unloaded
}
```

## Step-by-Step Tutorial

### 1. Set up your project

```bash
# Create a new directory
mkdir my-plugin
cd my-plugin

# Initialize package
npm init -y

# Install dependencies
npm install react react-dom
npm install --save-dev vite @vitejs/plugin-react typescript @types/react
```

### 2. Configure Vite

Create `vite.config.ts`:

```typescript
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

### 3. Create your plugin

Create `src/index.tsx`:

```tsx
import React, { useState } from 'react';

const MyPlugin = {
  id: "my-counter-plugin",
  manifest: {
    id: "my-counter-plugin",
    name: "Simple Counter",
    version: "1.0.0",
    description: "A simple counter plugin",
    author: "Your Name",
    iconUrl: "https://example.com/icon.png",
    entry: "",
    entrypoint: "https://example.com/plugin.js",
    preferredSize: {
      width: 400,
      height: 300
    }
  },
  
  init: async () => {
    console.log("Counter plugin initialized!");
  },
  
  render: () => {
    // Use React hooks for state management
    const [count, setCount] = useState(0);
    
    return (
      <div style={{ 
        padding: '20px',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <h2>Counter Plugin</h2>
        <p>Current count: {count}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setCount(count - 1)}
            style={{ padding: '8px 16px', borderRadius: '4px' }}
          >
            Decrease
          </button>
          <button 
            onClick={() => setCount(count + 1)}
            style={{ padding: '8px 16px', borderRadius: '4px' }}
          >
            Increase
          </button>
        </div>
      </div>
    );
  },
  
  onOpen: () => console.log("Counter plugin window opened"),
  onClose: () => console.log("Counter plugin window closed")
};

export default MyPlugin;
```

### 4. Create manifest file

Create `manifest.json` in the project root:

```json
{
  "id": "my-counter-plugin",
  "name": "Simple Counter",
  "version": "1.0.0",
  "description": "A simple counter plugin",
  "author": "Your Name",
  "iconUrl": "https://example.com/icon.png",
  "entrypoint": "https://example.com/plugin.js",
  "preferredSize": {
    "width": 400,
    "height": 300
  }
}
```

### 5. Build your plugin

```bash
npx vite build
```

This will create `dist/plugin.js` that you'll host on your server.

## Hosting Requirements

### File Structure

Host the following files on your server:

```
https://your-domain.com/my-plugin/
├── manifest.json
└── plugin.js
```

### CORS Configuration

Your server **must** configure these headers for dynamic imports to work:

For `plugin.js`:
```
Access-Control-Allow-Origin: * (or specific domain)
Content-Type: application/javascript
```

For `manifest.json`:
```
Access-Control-Allow-Origin: * (or specific domain)
Content-Type: application/json
```

### Hosting Options

- **GitHub Pages**: Simple static hosting
- **Vercel/Netlify**: Automatic deployments from Git
- **AWS S3**: Bucket with appropriate CORS config
- **Firebase Hosting**: Simple static hosting with CORS supported

## Installation Process

Users add your plugin by:

1. Opening Desktop Dreamscape
2. Navigating to Settings → Plugins
3. Clicking "Install from URL"
4. Entering the URL to your `manifest.json` file
5. Clicking "Install Plugin"

If the installation is successful, your plugin window will automatically open.

## API Reference

### Lifecycle Methods

- **init()**: Called when the plugin is registered
- **render()**: Called to render the plugin UI
- **onOpen()**: Called when the plugin window is opened
- **onClose()**: Called when the plugin window is closed
- **onMinimize()**: Called when the window is minimized
- **onMaximize()**: Called when the window is maximized
- **onDestroy()**: Called when the plugin is unloaded/uninstalled

### Event Bus

Desktop Dreamscape includes an event bus system you can use to communicate with the system or other plugins. Documentation will be expanded in future updates.

## Best Practices

1. **Keep it lightweight**: Minimize bundle size for faster loading
2. **Error handling**: Wrap operations in try/catch blocks
3. **Unique IDs**: Use a namespace (e.g., `com.mycompany.pluginname`)
4. **Clean up**: Release resources in `onDestroy()`
5. **Version properly**: Use semantic versioning
6. **Documentation**: Provide user documentation for your plugin
7. **Responsive UI**: Design your plugin to work at different window sizes

## Troubleshooting

### Common Issues

1. **Plugin not loading**: Check CORS headers on your server
2. **Missing icon**: Ensure the `iconUrl` points to a valid, accessible image
3. **Runtime errors**: Check the browser console for JavaScript errors
4. **ID collision**: Ensure your plugin ID doesn't conflict with built-in plugins

### Debug Mode

You can use browser dev tools to debug your plugin. All `console.log` statements from your plugin will appear in the browser console.

---

## Community & Support

For questions, feedback, or to showcase your plugins, please visit our community channels:

- [GitHub Repository](https://github.com/your-repo)
- [Documentation](https://your-docs-site.com)
- [Discord Community](https://discord.gg/your-invite)

---

*Happy plugin development!* 