import * as Comlink from "comlink";

import { PluginManifest } from "./types";

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
   * Terminate the worker
   */
  terminate(): void {
    this.worker.terminate();
    this.isConnected = false;
  }
}

// Export a singleton instance
export const workerPluginManager = new WorkerPluginManagerClient();
