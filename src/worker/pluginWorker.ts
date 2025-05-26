import * as Comlink from 'comlink';

// Handle Comlink port messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "comlink-port") {
    console.log("Received Comlink port in worker");
    const port = event.data.port;

    // Forward port to appropriate plugin if registered
    const workerPluginManager = (
      self as unknown as {
        workerPluginManager?: {
          plugins?: Map<
            string,
            { handleComlinkPort?: (port: MessagePort) => void }
          >;
        };
      }
    ).workerPluginManager;
    if (workerPluginManager && workerPluginManager.plugins) {
      const pyodidePlugin = workerPluginManager.plugins.get("pyodide");
      if (pyodidePlugin && pyodidePlugin.handleComlinkPort) {
        pyodidePlugin.handleComlinkPort(port);
      } else {
        console.warn("Pyodide plugin not found or does not support Comlink");
      }
    } else {
      console.warn("Worker plugin manager not available for Comlink setup");
    }
  }
});

// Define interface for worker plugins
interface WorkerPlugin {
  id: string;
  handle?: (method: string, params?: Record<string, unknown>) => unknown;
  [key: string]: unknown;
}

// Generic plugin method handler type
type PluginMethodHandler = (
  method: string,
  params?: Record<string, unknown>
) => Promise<unknown>;

// Define the response type
type PluginResponse =
  | { error: string }
  | { status: string; message?: string }
  | Record<string, unknown>
  | ReadableStream<unknown>
  | number
  | string
  | boolean
  | null;

/**
 * Worker-compatible version of Plugin Manager that doesn't rely on DOM
 * and exposes a serializable interface for Comlink
 */
class WorkerPluginManager {
  private plugins: Map<string, WorkerPlugin> = new Map();
  private pluginHandlers: Map<string, PluginMethodHandler> = new Map();

  constructor() {
    console.log("Worker Plugin Manager initialized");
  }

  /**
   * Dynamically import and register a plugin
   */
  async registerPlugin(
    pluginId: string,
    pluginUrl: string
  ): Promise<PluginResponse> {
    try {
      // If already registered, don't register again
      if (this.plugins.has(pluginId)) {
        return {
          status: "success",
          message: `Plugin ${pluginId} already registered`,
        };
      }

      console.log(
        `Attempting to register plugin: ${pluginId} from ${pluginUrl}`
      );

      // Prefix non-absolute plugin URLs with Vite base path
      const base = import.meta.env.BASE_URL;
      let resolvedUrl = pluginUrl;
      if (!resolvedUrl.startsWith("http")) {
        // Remove any leading slash to avoid double slashes
        resolvedUrl = base + resolvedUrl.replace(/^\//, "");
      }
      const importUrl = new URL(resolvedUrl, self.location.origin).href;
      console.log(`Resolved import URL: ${importUrl}`);

      // Try dynamic import with the resolved URL
      const pluginModule = await import(/* @vite-ignore */ importUrl);

      // Get the plugin instance
      const plugin = pluginModule.default || pluginModule;

      if (!plugin || !plugin.id) {
        return { error: `Invalid plugin module: ${importUrl}` };
      }

      // Register the plugin
      this.plugins.set(pluginId, plugin as WorkerPlugin);

      // Register the handler function
      if (typeof plugin.handle === "function") {
        // Create a wrapper function to maintain proper typing
        const handlerFn: PluginMethodHandler = async (method, params) => {
          return (
            (plugin as WorkerPlugin).handle?.(method, params) ?? {
              error: `Handler returned undefined`,
            }
          );
        };

        this.pluginHandlers.set(pluginId, handlerFn);
      } else {
        // Create a default handler that calls methods directly on the plugin
        this.pluginHandlers.set(pluginId, async (method, params) => {
          const typedPlugin = plugin as WorkerPlugin;
          const methodFn = typedPlugin[method];

          if (typeof methodFn !== "function") {
            throw new Error(`Method ${method} not found in plugin ${pluginId}`);
          }

          // Since we can't type this better without generics, we need to cast
          return (methodFn as (...args: unknown[]) => unknown)(
            ...(params ? Object.values(params) : [])
          );
        });
      }

      console.log(`Worker registered plugin: ${pluginId}`);

      return { status: "success", message: `Plugin ${pluginId} registered` };
    } catch (error) {
      console.error(`Failed to register plugin ${pluginId}:`, error);
      return {
        error: `Failed to register plugin ${pluginId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(pluginId: string): PluginResponse {
    if (!this.plugins.has(pluginId)) {
      return { error: `Plugin ${pluginId} not registered` };
    }

    this.plugins.delete(pluginId);
    this.pluginHandlers.delete(pluginId);

    console.log(`Worker unregistered plugin: ${pluginId}`);
    return { status: "success" };
  }

  /**
   * Check if a plugin is registered
   */
  isPluginRegistered(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Get plugin basic information
   */
  getPluginInfo(pluginId: string): { id: string } | null {
    const plugin = this.plugins.get(pluginId);
    return plugin ? { id: plugin.id } : null;
  }

  /**
   * Get all registered plugins' basic info
   */
  getAllPlugins(): Array<{ id: string }> {
    return Array.from(this.plugins.values()).map((plugin) => ({
      id: plugin.id,
    }));
  }

  /**
   * Call a plugin's method and return a serializable result
   */
  async callPlugin(
    pluginId: string,
    method: string,
    params?: Record<string, unknown>
  ): Promise<PluginResponse> {
    const handler = this.pluginHandlers.get(pluginId);

    if (!handler) {
      return { error: `Plugin ${pluginId} not registered` };
    }

    try {
      const result = await handler(method, params);

      // If the result is a ReadableStream, transfer it using Comlink
      if (result instanceof ReadableStream) {
        return Comlink.transfer(result, [result]);
      }

      return result as PluginResponse;
    } catch (error) {
      console.error(`Error calling plugin ${pluginId}.${method}:`, error);
      return {
        error: `Error in ${pluginId}.${method}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}

// Create the worker instance
const workerManager = new WorkerPluginManager();

// Expose all public methods via Comlink
Comlink.expose(workerManager);
