# Worker Plugin Architecture

This directory contains the core worker infrastructure for our application. The worker system enables computationally intensive tasks to be offloaded from the main UI thread to Web Workers, improving application responsiveness and user experience.

## Architecture Overview

The worker plugin system consists of:

1. **Plugin Worker (`pluginWorker.ts`)**: The main worker thread that dynamically loads and manages worker plugins.

2. **Worker Plugin Manager Client (`WorkerPluginManagerClient.ts`)**: Client-side wrapper that provides a clean API for React components to interact with the worker.

3. **Worker Plugins**: Individual plugin modules (located in `plugins/`) that implement specific functionality to run in a worker context.

4. **Plugin UI Components**: React components that use the Worker Plugin Manager Client to interact with worker plugins.

## Key Features

- **Dynamic loading** of worker plugins at runtime
- **Type-safe communication** between the main thread and worker thread
- **Pluggable architecture** that allows adding new worker plugins without modifying the core system
- **Standardized error handling** across all worker plugins
- **Automatic worker lifecycle management**

## Adding a New Worker Plugin

To add a new worker plugin:

1. Create a new TypeScript file in `src/worker/plugins/` (see template in `plugins/README.md`)
2. Implement the `WorkerPlugin` interface
3. Create React components in `src/plugins/apps/your-plugin/` that use the worker

Worker plugins are automatically built and included in the production bundle when running `npm run build` or `npm run build:workers`.

## Development vs. Production

In development, worker plugins are loaded directly from their source directories. In production, plugins are built using the `build-workers.cjs` script and placed in the `public/workers/` directory with the naming convention `plugin-name-worker.js`.

The system automatically determines the appropriate path to load plugins based on the current environment.

## Using Worker Plugins in React Components

```tsx
import React, { useEffect, useState } from 'react';
import { workerPluginManager } from '../../WorkerPluginManagerClient';

const MyPluginComponent: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  useEffect(() => {
    // Register the plugin
    const initPlugin = async () => {
      const success = await workerPluginManager.registerPlugin(
        'my-plugin',
        import.meta.env.PROD
          ? '/workers/my-plugin-worker.js'  // Production path (no 'public')
          : '/worker/plugins/my-plugin.js'         // Development path
      );
      
      if (success) {
        setIsWorkerReady(true);
      }
    };

    initPlugin();
  }, []);

  const handleOperation = async () => {
    try {
      const result = await workerPluginManager.callPlugin(
        'my-plugin',
        'myOperation',
        { param1: 'hello', param2: 42 }
      );
      
      setResult(String(result));
    } catch (error) {
      console.error('Error calling worker plugin:', error);
    }
  };

  return (
    <div>
      <button onClick={handleOperation} disabled={!isWorkerReady}>
        Run Operation
      </button>
      <div>Result: {result}</div>
    </div>
  );
};

export default MyPluginComponent;
```

## Build Process

The `scripts/build-workers.cjs` script:

1. Scans `src/worker/plugins/` for TypeScript files
2. Bundles each file with esbuild
3. Places the bundled files in `public/workers/` with the `-worker.js` suffix
4. Adds metadata comments to the bundled files

This happens automatically when running `npm run build`. 