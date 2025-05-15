import * as Comlink from 'comlink';

import { PluginManifest } from './types';

// Define interfaces matching the worker's API
interface WorkerPluginManager {
  registerPlugin(plugin: unknown): void;
  activatePlugin(pluginId: string): Promise<void>;
  deactivatePlugin(pluginId: string): void;
  loadPlugins(manifests: PluginManifest[]): Promise<void>;
  getPluginInfo(
    pluginId: string
  ): Promise<{ id: string; manifest: PluginManifest } | null>;
  isPluginActive(pluginId: string): Promise<boolean>;
  getAllPlugins(): Promise<Array<{ id: string; manifest: PluginManifest }>>;
  callPlugin(
    pluginId: string,
    method: string,
    params?: Record<string, unknown>
  ): Promise<unknown>;
}

/**
 * Client-side wrapper for the worker-based PluginManager
 * Provides a clean API for other components to interact with
 */
class WorkerPluginManagerClient {
  private worker: Worker;
  private workerApi: Comlink.Remote<WorkerPluginManager>;
  private isConnected = false;

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
      await this.workerApi.isPluginActive("calculator");
      this.isConnected = true;
      console.log("Worker connection established");
    } catch (error) {
      console.error("Failed to connect to plugin worker:", error);
      throw new Error("Failed to connect to plugin worker");
    }
  }

  /**
   * Activate a plugin in the worker
   */
  async activatePlugin(pluginId: string): Promise<void> {
    if (!this.isConnected) await this.connect();
    return this.workerApi.activatePlugin(pluginId);
  }

  /**
   * Deactivate a plugin in the worker
   */
  async deactivatePlugin(pluginId: string): Promise<void> {
    if (!this.isConnected) await this.connect();
    return this.workerApi.deactivatePlugin(pluginId);
  }

  /**
   * Check if a plugin is active
   */
  async isPluginActive(pluginId: string): Promise<boolean> {
    if (!this.isConnected) await this.connect();
    return this.workerApi.isPluginActive(pluginId);
  }

  /**
   * Get information about a specific plugin
   */
  async getPluginInfo(
    pluginId: string
  ): Promise<{ id: string; manifest: PluginManifest } | null> {
    if (!this.isConnected) await this.connect();
    return this.workerApi.getPluginInfo(pluginId);
  }

  /**
   * Get all registered plugins
   */
  async getAllPlugins(): Promise<
    Array<{ id: string; manifest: PluginManifest }>
  > {
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
    const result = await this.callPlugin("webllm", "loadModel", { modelName });

    if (typeof result === "object" && result !== null && "status" in result) {
      return result as { status: string; message?: string };
    }

    throw new Error("WebLLM loadModel returned invalid result");
  }

  /**
   * Helper method to get WebLLM progress
   */
  async getModelProgress(): Promise<{ text: string; progress: number }> {
    const result = await this.callPlugin("webllm", "getProgress");

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
    await this.callPlugin("webllm", "cleanup");
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    this.worker.terminate();
    this.isConnected = false;
  }
}

// Export a singleton instance
export const workerPluginManager = new WorkerPluginManagerClient();
