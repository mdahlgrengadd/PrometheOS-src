# Phase 3: Web Workers for Plugin Execution

This implementation fulfills Phase 3's goals from the roadmap:

1. **Workerize PluginManager** - The entire plugin initialization, message passing, and rendering logic now lives in a Web Worker.
2. **Use Comlink for RPC boundary** - Comlink provides the thin RPC boundary between the React UI thread and the worker.
3. **Migrate Calculator plugin** - The Calculator plugin has been migrated as a proof-of-concept.

## Architecture

### Components

1. **Worker** (`src/worker/pluginWorker.ts`)
   - Hosts the PluginManager and specific plugin logic
   - Exposed via Comlink
   - Contains serializable interfaces for cross-thread communication

2. **Client** (`src/plugins/WorkerPluginManagerClient.ts`)
   - Wraps the worker with a clean API
   - Hides Comlink implementation details
   - Provides specific helper methods for each plugin (e.g. `calculate`)

3. **Worker Calculator** (`src/plugins/apps/calculator/WorkerCalculatorContent.tsx`)
   - UI component that uses the worker for computation
   - Shows indicator during calculation
   - Handles errors and async state

## How to Use

Adding new plugins to the worker requires:

1. Import the plugin in the worker
2. Register it in the WorkerPluginManager
3. Add specific method handlers for the plugin
4. Extend the client wrapper with helper methods

## Testing

A test file (`src/tests/WorkerPluginManager.test.ts`) verifies:
- Worker connection
- Plugin registration
- Calculator operations

## Next Steps

- Complete migration of other plugins to the worker architecture
- Add proper sandboxing for security
- Implement capability negotiation for plugins
- Consider OffscreenCanvas for graphical plugins 