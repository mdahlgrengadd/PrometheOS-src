import * as Comlink from 'comlink';

// Import the manifest for pyodide-test to get the workerEntrypoint
import { manifest as pyodideTestManifest } from './apps/pyodide-test/manifest';
import { PluginManifest } from './types';

// Define interfaces matching the worker's API
interface WorkerPluginManager {
  registerPlugin(pluginId: string, pluginUrl: string): Promise<unknown>;
  unregisterPlugin(pluginId: string): Promise<unknown>;
  isPluginRegistered(pluginId: string): Promise<boolean>;
  getPluginInfo(pluginId: string): Promise<{ id: string } | null>;
  getAllPlugins(): Promise<Array<{ id: string }>>;
  callPlugin(
    pluginId: string,
    method: string,
    params?: Record<string, unknown>
  ): Promise<unknown>;
}

// Map plugin manifests to their worker URLs
interface PluginWorkerInfo {
  id: string;
  workerUrl: string;
  isRegistered: boolean;
}

/**
 * Client-side wrapper for the worker-based PluginManager
 * Provides a clean API for other components to interact with
 */
class WorkerPluginManagerClient {
  private worker: Worker;
  private workerApi: Comlink.Remote<WorkerPluginManager>;
  private isConnected = false;
  private registeredPlugins: Map<string, PluginWorkerInfo> = new Map();
  constructor() {
    // Create the worker with the pluginWorker.ts file
    this.worker = new Worker(
      new URL("../worker/pluginWorker.ts", import.meta.url),
      { type: "module" }
    );

    // Wrap the worker with Comlink
    this.workerApi = Comlink.wrap<WorkerPluginManager>(this.worker);

    // Set up message handler for desktop API bridge requests
    this.setupDesktopApiBridgeHandler();
  }

  /**
   * Initialize the connection to the worker
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      // Make a simple call to check if the worker is responsive
      await this.workerApi.getAllPlugins();
      this.isConnected = true;
      console.log("Worker connection established");
    } catch (error) {
      console.error("Failed to connect to plugin worker:", error);
      throw new Error("Failed to connect to plugin worker");
    }
  }

  /**
   * Register a plugin with the worker
   */
  async registerPlugin(pluginId: string, pluginUrl: string): Promise<boolean> {
    if (!this.isConnected) await this.connect();

    try {
      const result = await this.workerApi.registerPlugin(pluginId, pluginUrl);

      if (
        result &&
        typeof result === "object" &&
        "status" in result &&
        result.status === "success"
      ) {
        this.registeredPlugins.set(pluginId, {
          id: pluginId,
          workerUrl: pluginUrl,
          isRegistered: true,
        });
        return true;
      }

      console.error("Failed to register plugin:", result);
      return false;
    } catch (error) {
      console.error(`Error registering plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Unregister a plugin from the worker
   */
  async unregisterPlugin(pluginId: string): Promise<boolean> {
    if (!this.isConnected) await this.connect();

    try {
      const result = await this.workerApi.unregisterPlugin(pluginId);

      if (
        result &&
        typeof result === "object" &&
        "status" in result &&
        result.status === "success"
      ) {
        if (this.registeredPlugins.has(pluginId)) {
          const pluginInfo = this.registeredPlugins.get(pluginId)!;
          this.registeredPlugins.set(pluginId, {
            ...pluginInfo,
            isRegistered: false,
          });
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error unregistering plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Check if a plugin is registered in the worker
   */
  async isPluginRegistered(pluginId: string): Promise<boolean> {
    if (!this.isConnected) await this.connect();
    return this.workerApi.isPluginRegistered(pluginId);
  }

  /**
   * Get information about a specific plugin
   */
  async getPluginInfo(pluginId: string): Promise<{ id: string } | null> {
    if (!this.isConnected) await this.connect();
    return this.workerApi.getPluginInfo(pluginId);
  }

  /**
   * Get all registered plugins
   */
  async getAllPlugins(): Promise<Array<{ id: string }>> {
    if (!this.isConnected) await this.connect();
    return this.workerApi.getAllPlugins();
  }

  /**
   * Call a specific plugin method with parameters
   */
  async callPlugin(
    pluginId: string,
    method: string,
    params?: Record<string, unknown>
  ): Promise<unknown> {
    if (!this.isConnected) await this.connect();

    // Check if plugin is registered, if not, try to register it
    const isRegistered = await this.isPluginRegistered(pluginId);
    if (!isRegistered) {
      const pluginInfo = this.registeredPlugins.get(pluginId);
      if (pluginInfo && !pluginInfo.isRegistered) {
        const success = await this.registerPlugin(
          pluginId,
          pluginInfo.workerUrl
        );
        if (!success) {
          throw new Error(`Failed to register plugin ${pluginId}`);
        }
      } else {
        throw new Error(`Plugin ${pluginId} not registered`);
      }
    }

    return this.workerApi.callPlugin(pluginId, method, params);
  }

  /**
   * Helper method specifically for the calculator
   */
  async calculate(
    firstOperand: number,
    secondOperand: number,
    operator: string
  ): Promise<number> {
    // Make sure calculator plugin is registered
    if (!this.registeredPlugins.has("calculator")) {
      // Get the correct worker path based on environment
      const workerPath = import.meta.env.PROD
        ? import.meta.env.BASE_URL + "/worker/calculator.js" // Production path
        : import.meta.env.BASE_URL + "/worker/calculator.js"; // Development path

      await this.registerPlugin("calculator", workerPath);
    }

    const result = await this.callPlugin("calculator", "calculate", {
      firstOperand,
      secondOperand,
      operator,
    });

    if (typeof result === "number") {
      return result;
    }

    throw new Error("Calculator returned non-numeric result");
  }

  /**
   * Helper method to load a WebLLM model
   */
  async loadModel(
    modelName: string
  ): Promise<{ status: string; message?: string }> {
    // Make sure webllm plugin is registered
    if (!this.registeredPlugins.has("webllm")) {
      // Get the correct worker path based on environment
      const workerPath = import.meta.env.PROD
        ? import.meta.env.BASE_URL + "/worker/webllm.js" // Production path
        : import.meta.env.BASE_URL + "/worker/webllm.js"; // Development path

      await this.registerPlugin("webllm", workerPath);
    }

    const result = await this.callPlugin("webllm", "loadModel", { modelName });

    if (typeof result === "object" && result !== null && "status" in result) {
      return result as { status: string; message?: string };
    }

    throw new Error("WebLLM loadModel returned invalid result");
  }

  /**
   * Helper method to get WebLLM progress
   */
  async getModelProgress(): Promise<{ text: string; progress: number } | null> {
    // Make sure webllm plugin is registered
    if (!this.registeredPlugins.has("webllm")) {
      // Get the correct worker path based on environment
      const workerPath = import.meta.env.PROD
        ? import.meta.env.BASE_URL + "/worker/webllm.js" // Production path
        : import.meta.env.BASE_URL + "/worker/webllm.js"; // Development path

      await this.registerPlugin("webllm", workerPath);
    }

    const result = await this.callPlugin("webllm", "getProgress");

    if (result === null) {
      return null;
    }

    if (
      typeof result === "object" &&
      result !== null &&
      "text" in result &&
      "progress" in result
    ) {
      return result as { text: string; progress: number };
    }

    return { text: "", progress: 0 };
  }

  /**
   * Helper method to chat with WebLLM
   * Returns a ReadableStream that can be consumed in the UI
   */
  async chat(
    messages: { role: string; content: string }[],
    temperature: number = 0.7
  ): Promise<ReadableStream<string>> {
    // Make sure webllm plugin is registered
    if (!this.registeredPlugins.has("webllm")) {
      // Get the correct worker path based on environment
      const workerPath = import.meta.env.PROD
        ? import.meta.env.BASE_URL + "/worker/webllm.js" // Production path
        : import.meta.env.BASE_URL + "/worker/webllm.js"; // Development path

      await this.registerPlugin("webllm", workerPath);
    }

    // Call the worker and get the response
    const result = await this.callPlugin("webllm", "chat", {
      messages,
      temperature,
    });

    // If result is an error object
    if (typeof result === "object" && result !== null && "error" in result) {
      throw new Error(String(result.error));
    }

    // The worker transfers the ReadableStream, so it should be usable directly
    if (result instanceof ReadableStream) {
      return result;
    }

    // In case it's not a ReadableStream for some reason, throw an error
    throw new Error("WebLLM chat did not return a ReadableStream");
  }

  /**
   * Clean up WebLLM resources
   */
  async cleanupWebLLM(): Promise<void> {
    if (!this.registeredPlugins.has("webllm")) {
      return; // No need to clean up if not registered
    }
    await this.callPlugin("webllm", "cleanup");
  }

  // Pyodide Helper Methods

  /**
   * Initialize Pyodide runtime
   */
  async initPyodide(): Promise<{ status: string; message?: string }> {
    // Make sure pyodide plugin is registered
    if (!this.registeredPlugins.has("pyodide")) {
      // Use the manifest's workerEntrypoint directly
      // Import the manifest at the top of the file:
      // import { manifest as pyodideTestManifest } from "./apps/pyodide-test/manifest";
      const workerPath = pyodideTestManifest.workerEntrypoint;
      await this.registerPlugin("pyodide", workerPath);
    }

    const result = await this.callPlugin("pyodide", "initPyodide");

    if (typeof result === "object" && result !== null && "status" in result) {
      return result as { status: string; message?: string };
    }

    throw new Error("Pyodide initPyodide returned invalid result");
  }

  /**
   * Execute Python code
   */
  async executePython(
    code: string,
    returnStdout: boolean = false
  ): Promise<{
    success: boolean;
    result?: unknown;
    error?: string;
    stdout?: string;
  }> {
    if (!this.registeredPlugins.has("pyodide")) {
      const workerPath = pyodideTestManifest.workerEntrypoint;
      await this.registerPlugin("pyodide", workerPath);
    }

    const result = await this.callPlugin("pyodide", "executePython", {
      code,
      returnStdout,
    });

    if (typeof result === "object" && result !== null && "success" in result) {
      return result as {
        success: boolean;
        result?: unknown;
        error?: string;
        stdout?: string;
      };
    }

    throw new Error("Python execution returned invalid result");
  }

  /**
   * Install Python package via micropip
   */
  async installPythonPackage(
    packageName: string
  ): Promise<{ success: boolean; result?: string; error?: string }> {
    if (!this.registeredPlugins.has("pyodide")) {
      const workerPath = pyodideTestManifest.workerEntrypoint;
      await this.registerPlugin("pyodide", workerPath);
    }

    const result = await this.callPlugin("pyodide", "installPackage", {
      packageName,
    });

    if (typeof result === "object" && result !== null && "success" in result) {
      return result as { success: boolean; result?: string; error?: string };
    }

    throw new Error("Python package installation returned invalid result");
  }

  /**
   * Get Pyodide initialization progress
   */
  async getPyodideProgress(): Promise<{
    phase: string;
    message: string;
    progress?: number;
  } | null> {
    if (!this.registeredPlugins.has("pyodide")) {
      return null;
    }

    const result = await this.callPlugin("pyodide", "getProgress");

    if (result === null) {
      return null;
    }

    if (
      typeof result === "object" &&
      result !== null &&
      "phase" in result &&
      "message" in result
    ) {
      return result as { phase: string; message: string; progress?: number };
    }

    return null;
  }

  /**
   * Check if Pyodide is ready for execution
   */
  async isPyodideReady(): Promise<boolean> {
    if (!this.registeredPlugins.has("pyodide")) {
      return false;
    }

    const result = await this.callPlugin("pyodide", "isReady");
    return Boolean(result);
  }

  /**
   * Clean up Pyodide resources
   */
  async cleanupPyodide(): Promise<void> {
    if (!this.registeredPlugins.has("pyodide")) {
      return;
    }
    await this.callPlugin("pyodide", "cleanup");
  }

  // MCP Server Helper Methods

  /**
   * Initialize MCP server
   */
  async initMCPServer(): Promise<{ status: string; message?: string }> {
    if (!this.registeredPlugins.has("mcp-server")) {
      const workerPath = import.meta.env.PROD
        ? import.meta.env.BASE_URL + "/worker/mcp-server.js"
        : import.meta.env.BASE_URL + "/worker/mcp-server.js";

      await this.registerPlugin("mcp-server", workerPath);
    }

    const result = await this.callPlugin("mcp-server", "initialize");

    if (typeof result === "object" && result !== null && "status" in result) {
      return result as { status: string; message?: string };
    }

    throw new Error("MCP Server initialization returned invalid result");
  }

  /**
   * Register an MCP tool from API component
   */
  async registerMCPTool(
    componentId: string,
    action: string,
    description: string,
    parameters?: Record<
      string,
      { type: string; description?: string; required?: boolean }
    >
  ): Promise<{ status: string; message?: string }> {
    if (!this.registeredPlugins.has("mcp-server")) {
      await this.initMCPServer();
    }

    const result = await this.callPlugin("mcp-server", "registerTool", {
      componentId,
      action,
      description,
      parameters,
    });

    if (typeof result === "object" && result !== null && "status" in result) {
      return result as { status: string; message?: string };
    }

    throw new Error("MCP tool registration returned invalid result");
  }
  /**
   * Get all available MCP tools
   */
  async getMCPTools(): Promise<
    Array<{
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
    }>
  > {
    if (!this.registeredPlugins.has("mcp-server")) {
      return [];
    }

    const result = await this.callPlugin("mcp-server", "getAvailableTools");

    if (Array.isArray(result)) {
      return result as Array<{
        name: string;
        description: string;
        inputSchema: Record<string, unknown>;
      }>;
    }

    return [];
  }
  /**
   * Execute an MCP tool
   */
  async executeMCPTool(toolCall: {
    name: string;
    arguments: Record<string, unknown>;
  }): Promise<{
    content: Array<{ type: string; text?: string }>;
    isError?: boolean;
  }> {
    if (!this.registeredPlugins.has("mcp-server")) {
      return {
        content: [{ type: "text", text: "MCP Server not initialized" }],
        isError: true,
      };
    }

    const result = await this.callPlugin("mcp-server", "executeTool", {
      toolCall,
    });

    if (
      typeof result === "object" &&
      result !== null &&
      "content" in result &&
      Array.isArray((result as Record<string, unknown>).content)
    ) {
      return result as {
        content: Array<{ type: string; text?: string }>;
        isError?: boolean;
      };
    }

    return {
      content: [{ type: "text", text: "Invalid tool execution result" }],
      isError: true,
    };
  }

  /**
   * Auto-register all API components as MCP tools
   */
  async autoRegisterMCPTools(
    components: Array<{
      id: string;
      actions: Array<{
        name: string;
        description: string;
        parameters?: Record<
          string,
          { type: string; description?: string; required?: boolean }
        >;
      }>;
    }>
  ): Promise<{ status: string; registered: number; errors: string[] }> {
    if (!this.registeredPlugins.has("mcp-server")) {
      await this.initMCPServer();
    }

    const result = await this.callPlugin(
      "mcp-server",
      "autoRegisterFromApiComponents",
      { components }
    );

    if (
      typeof result === "object" &&
      result !== null &&
      "status" in result &&
      "registered" in result &&
      "errors" in result
    ) {
      return result as { status: string; registered: number; errors: string[] };
    }

    throw new Error("Auto-registration returned invalid result");
  }

  /**
   * Get MCP server statistics
   */
  async getMCPStats(): Promise<{ toolCount: number; isInitialized: boolean }> {
    if (!this.registeredPlugins.has("mcp-server")) {
      return { toolCount: 0, isInitialized: false };
    }

    const result = await this.callPlugin("mcp-server", "getStats");

    if (
      typeof result === "object" &&
      result !== null &&
      "toolCount" in result &&
      "isInitialized" in result
    ) {
      return result as { toolCount: number; isInitialized: boolean };
    }

    return { toolCount: 0, isInitialized: false };
  }

  /**
   * Clean up MCP server resources
   */
  async cleanupMCPServer(): Promise<void> {
    if (!this.registeredPlugins.has("mcp-server")) {
      return;
    }
    await this.callPlugin("mcp-server", "cleanup");
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    this.worker.terminate();
    this.isConnected = false;
    this.registeredPlugins.clear();
  }

  /**
   * Set up message handler for desktop API bridge requests from Pyodide workers
   */
  private setupDesktopApiBridgeHandler(): void {
    this.worker.addEventListener("message", async (event) => {
      const { data } = event;

      // Check if this is a desktop API request
      if (data && data.type === "desktop-api-request") {
        const { requestId, method, params } = data;

        try {
          let result: unknown; // Get the global API bridge
          const bridge = (globalThis as Record<string, unknown>)
            .desktop_api_bridge;

          if (!bridge) {
            throw new Error("Desktop API bridge not available");
          } // Handle different API methods
          switch (method) {
            case "list_components": {
              result = (
                bridge as { listComponents(): string[] }
              ).listComponents();
              break;
            }

            case "execute_action": {
              if (!params || !params.componentId || !params.action) {
                throw new Error(
                  "Missing required parameters for execute_action"
                );
              }
              result = await (
                bridge as {
                  execute(
                    componentId: string,
                    action: string,
                    params?: Record<string, unknown>
                  ): Promise<unknown>;
                }
              ).execute(
                params.componentId as string,
                params.action as string,
                params.params as Record<string, unknown>
              );
              break;
            }

            case "subscribe_event": {
              if (!params || !params.eventName) {
                throw new Error("Missing eventName for subscribe_event");
              }
              // For event subscription, we need to set up a callback that sends messages back to worker
              const unsubscribe = (
                bridge as {
                  subscribeEvent(
                    eventName: string,
                    callback: (data: unknown) => void
                  ): () => void;
                }
              ).subscribeEvent(
                params.eventName as string,
                (eventData: unknown) => {
                  this.worker.postMessage({
                    type: "desktop-api-event",
                    requestId,
                    eventName: params.eventName,
                    data: eventData,
                  });
                }
              );
              result = { success: true, unsubscribe: requestId }; // Use requestId as unsubscribe token
              break;
            }

            case "emit_event": {
              if (!params || !params.eventName) {
                throw new Error("Missing eventName for emit_event");
              }
              (
                bridge as { emitEvent(eventName: string, data?: unknown): void }
              ).emitEvent(params.eventName as string, params.data);
              result = { success: true };
              break;
            }

            default:
              throw new Error(`Unknown desktop API method: ${method}`);
          }

          // Send successful response back to worker
          this.worker.postMessage({
            type: "desktop-api-response",
            requestId,
            success: true,
            result,
          });
        } catch (error) {
          // Send error response back to worker
          this.worker.postMessage({
            type: "desktop-api-response",
            requestId,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      // Handle MCP protocol messages
      else if (data && data.type === "mcp-protocol-message") {
        const message = data.message;

        try {
          // Get the MCP protocol handler
          const mcpHandler = (globalThis as Record<string, unknown>)
            .desktop_mcp_handler;

          if (!mcpHandler) {
            throw new Error("MCP protocol handler not available");
          }

          // Process the message through the MCP handler
          const response = await (
            mcpHandler as {
              processMessage(message: unknown): Promise<unknown>;
            }
          ).processMessage(message);

          // Send the response back to the worker
          this.worker.postMessage({
            type: "mcp-protocol-response",
            message: response,
          });
        } catch (error) {
          // Send error response in JSON-RPC 2.0 format
          this.worker.postMessage({
            type: "mcp-protocol-response",
            message: {
              jsonrpc: "2.0",
              error: {
                code: -32603,
                message: error instanceof Error ? error.message : String(error),
              },
              id: message?.id || null,
            },
          });
        }
      }
    });
  }

  /**
   * Initialize Comlink exposure for the desktop API bridge
   * This exposes the bridge methods directly to the Pyodide worker via Comlink
   */
  async setupComlinkBridge(): Promise<void> {
    // Get the desktop API bridge
    const bridge = (globalThis as Record<string, unknown>).desktop_api_bridge;

    if (!bridge) {
      console.error("Desktop API bridge not available for Comlink exposure");
      return;
    }

    try {
      // Create a message channel for dedicated Comlink communication
      const { port1, port2 } = new MessageChannel();

      // Send the port to the plugin worker for Comlink bridging
      console.log("Sending Comlink port to plugin worker");
      this.worker.postMessage({ type: "comlink-port", port: port2 }, [port2]);

      // Expose the desktop API bridge via Comlink on port1
      Comlink.expose(bridge, port1);

      console.log("Desktop API bridge exposed via Comlink on message channel");
    } catch (error) {
      console.error("Failed to expose Desktop API bridge via Comlink:", error);
    }
  }
}

// Export a singleton instance
export const workerPluginManager = new WorkerPluginManagerClient();

// Make it available globally for other modules to access
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).workerPluginManager =
    workerPluginManager;
}
