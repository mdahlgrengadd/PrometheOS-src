/**
 * Refactored Pyodide Worker Plugin - Python runtime in Web Worker
 * Follows the established worker plugin pattern from webllm.ts
 */

// WorkerPlugin interface from the worker module
interface WorkerPlugin {
  id: string;
  handle?: (method: string, params?: Record<string, unknown>) => unknown;
  handleComlinkPort?: (port: MessagePort) => void;
  [key: string]: unknown;
}

import { BridgeSetup } from "./bridge";
import { ComlinkHandler } from "./comlink-handler";
import { PyodideCore } from "./core";
import { DesktopAPIHandler } from "./desktop-api-handler";
import { MCPHandler } from "./mcp-handler";
import { setBaseUrl } from "./python-loader";

import type { PythonResult, PyodideProgress } from "./types";

/**
 * Pyodide plugin implementation for worker
 */
const PyodideWorker: WorkerPlugin = {
  id: "pyodide",

  // Private components
  _core: new PyodideCore(),
  _bridge: null as BridgeSetup | null,
  _mcpHandler: null as MCPHandler | null,
  _comlinkHandler: new ComlinkHandler(),
  _desktopAPIHandler: new DesktopAPIHandler(),
  /**
   * Initialize Pyodide with progress tracking
   */
  async initPyodide(params?: { baseUrl?: string }): Promise<{ status: string; message?: string }> {
    // Set the base URL for Python file loading if provided
    if (params?.baseUrl) {
      setBaseUrl(params.baseUrl);
    }
    
    const result = await this._core.initPyodide();

    if (result.status === "success") {
      const pyodide = this._core.getPyodide();
      if (pyodide) {
        // Initialize bridge and handlers
        this._bridge = new BridgeSetup(pyodide);
        this._mcpHandler = new MCPHandler(this._forwardToMCPServer.bind(this));

        // Setup Desktop API bridge
        await this._setupDesktopApiBridge();

        // Enhance Comlink integration
        try {
          await this._enhanceComlinkIntegration();
        } catch (error) {
          console.warn(
            "Failed to enhance Comlink integration, but continuing:",
            error
          );
        }
      }
    }

    return result;
  },

  /**
   * Setup the Desktop API bridge in Python context
   */
  async _setupDesktopApiBridge(): Promise<void> {
    if (!this._bridge) {
      throw new Error("Bridge not initialized");
    }

    await this._bridge.setupDesktopApiBridge(this);
  },

  /**
   * Execute Python code and return result
   */
  async executePython(
    code: string,
    returnStdout: boolean = false
  ): Promise<PythonResult> {
    return this._core.executePython(code, returnStdout);
  },

  /**
   * Install Python packages using micropip
   */
  async installPackage(packageName: string): Promise<PythonResult> {
    return this._core.installPackage(packageName);
  },

  /**
   * Get current initialization progress
   */
  getProgress(): PyodideProgress | null {
    return this._core.getProgress();
  },

  /**
   * Check if Pyodide is ready
   */
  isReady(): boolean {
    return this._core.isReady();
  },

  /**
   * Clean up resources
   */
  cleanup(): void {
    this._core.cleanup();
    this._bridge = null;
    this._mcpHandler = null;
  },

  /**
   * Handle MCP Protocol JSON-RPC 2.0 messages
   */
  async handleMCPProtocolMessage(
    messageOrJson: Record<string, unknown> | string
  ): Promise<PythonResult> {
    if (!this._mcpHandler) {
      return {
        success: false,
        error: "MCP handler not initialized",
      };
    }

    return this._mcpHandler.handleMCPProtocolMessage(messageOrJson);
  },

  /**
   * Forward a message to the MCP server plugin
   */
  async _forwardToMCPServer(
    message: Record<string, unknown>
  ): Promise<unknown> {
    // Get access to the worker plugin manager
    const workerPluginManagerGlobal = self as unknown as {
      workerPluginManager?: {
        callPlugin: (
          pluginId: string,
          method: string,
          params?: Record<string, unknown>
        ) => Promise<unknown>;
      };
    };

    const manager = workerPluginManagerGlobal.workerPluginManager;
    if (!manager) {
      throw new Error("Worker plugin manager not available");
    }

    // Check if MCP server plugin is registered, register it if not
    try {
      const isRegistered = await manager.callPlugin(
        "mcp-server",
        "isInitialized"
      );

      if (!isRegistered) {
        console.log("MCP server not initialized, initializing...");
        await manager.callPlugin("mcp-server", "initialize");
      }
    } catch (error) {
      console.warn(
        "Error checking MCP server, will try to call anyway:",
        error
      );
    }

    // Call the MCP server plugin
    return manager.callPlugin("mcp-server", "processMCPMessage", {
      message,
    });
  },

  /**
   * Handle Comlink port message from main thread
   */
  handleComlinkPort(port: MessagePort): void {
    this._comlinkHandler.handleComlinkPort(port);
  },

  /**
   * Generic handler function that processes method calls with parameters
   */  handle(method: string, params?: Record<string, unknown>): unknown {
    switch (method) {
      case "initPyodide":
        return this.initPyodide(params as { baseUrl?: string });

      case "executePython":
        if (typeof params?.code !== "string") {
          return {
            success: false,
            error: "executePython requires 'code' parameter",
          };
        }
        return this.executePython(params.code, Boolean(params.returnStdout));

      case "installPackage":
        if (typeof params?.packageName !== "string") {
          return {
            success: false,
            error: "installPackage requires 'packageName' parameter",
          };
        }
        return this.installPackage(params.packageName);

      case "getProgress":
        return this.getProgress();

      case "isReady":
        return this.isReady();

      case "cleanup":
        return this.cleanup();

      case "handleDesktopApiRequest":
        if (
          typeof params?.method !== "string" ||
          typeof params?.requestId !== "string"
        ) {
          return {
            success: false,
            error:
              "handleDesktopApiRequest requires 'method' and 'requestId' parameters",
          };
        }
        return this.handleDesktopApiRequest(
          params.method,
          params.requestId,
          params.params as Record<string, unknown>
        );

      case "handleMCPProtocolMessage":
        if (params?.message === undefined) {
          return {
            success: false,
            error: "handleMCPProtocolMessage requires 'message' parameter",
          };
        }
        return this.handleMCPProtocolMessage(params.message);

      case "handleComlinkPort":
        if (!params?.port || !(params.port instanceof MessagePort)) {
          return {
            success: false,
            error: "handleComlinkPort requires a valid MessagePort parameter",
          };
        }
        return this.handleComlinkPort(params.port as MessagePort);

      default:
        return { success: false, error: `Unknown method: ${method}` };
    }
  },

  /**
   * Handle desktop API requests from Python
   */
  async handleDesktopApiRequest(
    method: string,
    requestId: string,
    params?: Record<string, unknown>
  ): Promise<PythonResult> {
    return this._desktopAPIHandler.handleDesktopApiRequest(
      method,
      requestId,
      params
    );
  },

  /**
   * Add Comlink helper methods to Python
   * This sets up better communication between Python and Comlink
   */
  async _enhanceComlinkIntegration(): Promise<void> {
    if (!this._bridge) {
      throw new Error("Bridge not initialized");
    }

    await this._bridge.enhanceComlinkIntegration();
  },
};

// Export the pyodide plugin instance as default
export default PyodideWorker;
