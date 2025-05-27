import * as Comlink from 'comlink';

// Buffer for Comlink port until pyodide plugin is registered
let pendingComlinkPort: MessagePort | null = null;

// Handle Comlink port messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "comlink-port") {
    console.log("Received Comlink port in worker");
    // Retrieve the port from data or fallback to transferred ports
    const port: MessagePort | undefined =
      (event.data.port as MessagePort) || event.ports?.[0];
    if (!port) {
      console.error("Comlink port not found in message");
      return;
    }

    // Try to forward to pyodide plugin if registered
    const workerPluginManagerGlobal = self as unknown as {
      workerPluginManager?: WorkerPluginManager;
    };
    const manager = workerPluginManagerGlobal.workerPluginManager;
    if (manager) {
      const pyodidePlugin = manager.getPlugins().get("pyodide");
      if (
        pyodidePlugin &&
        typeof pyodidePlugin.handleComlinkPort === "function"
      ) {
        pyodidePlugin.handleComlinkPort(port);
      } else {
        console.warn("Pyodide plugin not ready, buffering Comlink port");
        pendingComlinkPort = port;
      }
    } else {
      console.warn(
        "Worker plugin manager not available for Comlink setup, buffering port"
      );
      pendingComlinkPort = port;
    }
  }
  // Handle MCP protocol messages
  else if (event.data && event.data.type === "mcp-protocol-message") {
    const workerPluginManagerGlobal = self as unknown as {
      workerPluginManager?: WorkerPluginManager;
    };
    const manager = workerPluginManagerGlobal.workerPluginManager;

    if (manager) {
      const mcpServerPlugin = manager.getPlugins().get("mcp-server");
      if (mcpServerPlugin) {
        // Process the MCP message through the server plugin
        const message = event.data.message;

        // Call the processMCPMessage method - properly type the plugin
        (async () => {
          try {
            // Explicitly type the plugin with processMCPMessage method
            const typedPlugin = mcpServerPlugin as unknown as {
              processMCPMessage: (message: any) => Promise<any>;
            };

            const response = await typedPlugin.processMCPMessage(message);
            // Send response back to main thread
            self.postMessage({
              type: "mcp-protocol-response",
              message: response,
            });
          } catch (error) {
            // Send error response
            self.postMessage({
              type: "mcp-protocol-response",
              message: {
                jsonrpc: "2.0",
                error: {
                  code: -32603,
                  message:
                    error instanceof Error ? error.message : String(error),
                },
                id: message?.id || null,
              },
            });
          }
        })();
      } else {
        // MCP Server plugin not registered yet
        self.postMessage({
          type: "mcp-protocol-response",
          message: {
            jsonrpc: "2.0",
            error: {
              code: -32601,
              message: "MCP Server plugin not available",
            },
            id: event.data.message?.id || null,
          },
        });
      }
    }
  }
});

// Define interface for worker plugins
interface WorkerPlugin {
  id: string;
  handle?: (method: string, params?: Record<string, unknown>) => unknown;
  /** Optional hook for setting up Comlink on a MessagePort */
  handleComlinkPort?: (port: MessagePort) => void;
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
   * Public accessor for plugins map (needed for Comlink setup)
   */
  public getPlugins(): Map<string, WorkerPlugin> {
    return this.plugins;
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
        // If the pluginUrl already starts with base, don't add it again
        if (pluginUrl.startsWith(base)) {
          resolvedUrl = pluginUrl;
        } else {
          // Remove any leading slash to avoid double slashes
          resolvedUrl = base + pluginUrl.replace(/^\//, "");
        }
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
      console.log(`WorkerPluginManager: registering plugin ${pluginId}`);
      this.plugins.set(pluginId, plugin as WorkerPlugin);

      // If we have a buffered Comlink port and this is the pyodide plugin, forward it now
      if (pluginId === "pyodide") {
        console.log("WorkerPluginManager: pyodide plugin registered");
        if (pendingComlinkPort) {
          const pyodidePlugin = this.getPlugins().get("pyodide");
          if (pyodidePlugin?.handleComlinkPort) {
            console.log("Forwarding buffered Comlink port to pyodide plugin");
            pyodidePlugin.handleComlinkPort(pendingComlinkPort);
            pendingComlinkPort = null;
          } else {
            console.warn(
              "pyodide plugin missing handleComlinkPort, cannot forward port"
            );
          }
        }
      }

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

// Make the worker manager available globally for port routing
// Make available on both self and globalThis for broader compatibility
(
  self as unknown as { workerPluginManager?: WorkerPluginManager }
).workerPluginManager = workerManager;
(
  globalThis as unknown as { workerPluginManager?: WorkerPluginManager }
).workerPluginManager = workerManager;

// Debug log to confirm global availability
console.log("Plugin worker manager initialized and exposed globally");
console.log("  - self has workerPluginManager:", "workerPluginManager" in self);
console.log(
  "  - globalThis has workerPluginManager:",
  "workerPluginManager" in globalThis
);

// Expose all public methods via Comlink
Comlink.expose(workerManager);
