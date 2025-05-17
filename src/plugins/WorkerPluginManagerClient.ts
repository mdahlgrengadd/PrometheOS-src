import * as Comlink from 'comlink';

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
        ? "/worker/calculator.js" // Production path
        : "/worker/calculator.js"; // Development path

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
        ? "/worker/webllm.js" // Production path
        : "/worker/webllm.js"; // Development path

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
        ? "/worker/webllm.js" // Production path
        : "/worker/webllm.js"; // Development path

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
        ? "/worker/webllm.js" // Production path
        : "/worker/webllm.js"; // Development path

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

  /**
   * Terminate the worker
   */
  terminate(): void {
    this.worker.terminate();
    this.isConnected = false;
    this.registeredPlugins.clear();
  }
}

// Export a singleton instance
export const workerPluginManager = new WorkerPluginManagerClient();
