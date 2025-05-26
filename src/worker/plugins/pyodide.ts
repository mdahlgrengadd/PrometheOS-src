/**
 * Pyodide Worker Plugin - Python runtime in Web Worker
 * Follows the established worker plugin pattern from webllm.ts
 */

import { WorkerPlugin } from "../../plugins/types";

// Interface for Python execution results
export interface PythonResult {
  success: boolean;
  result?: unknown;
  error?: string;
  stdout?: string;
}

// Interface for progress updates during Pyodide loading
export interface PyodideProgress {
  phase: "initializing" | "downloading" | "extracting" | "ready";
  message: string;
  progress?: number;
}

// Pyodide interface (we'll load it dynamically)
interface PyodideInterface {
  runPython(code: string): unknown;
  loadPackage(packages: string | string[]): Promise<void>;
  globals: {
    get(name: string): unknown;
    set(name: string, value: unknown): void;
  };
  FS: {
    writeFile(path: string, data: string | Uint8Array): void;
    readFile(
      path: string,
      options?: { encoding?: string }
    ): string | Uint8Array;
  };
}

declare global {
  interface Window {
    loadPyodide?: (options?: {
      indexURL?: string;
    }) => Promise<PyodideInterface>;
  }
}

/**
 * Pyodide plugin implementation for worker
 */
const PyodideWorker: WorkerPlugin = {
  id: "pyodide",

  // Private state
  _pyodide: null as PyodideInterface | null,
  _isLoading: false,
  _progress: null as PyodideProgress | null,
  /**
   * Initialize Pyodide with progress tracking
   */
  async initPyodide(): Promise<{ status: string; message?: string }> {
    if (this._pyodide) {
      return { status: "success", message: "Pyodide already initialized" };
    }

    if (this._isLoading) {
      return {
        status: "loading",
        message: "Pyodide initialization in progress",
      };
    }

    try {
      this._isLoading = true;
      this._progress = {
        phase: "initializing",
        message: "Starting Pyodide initialization...",
      };

      console.log("Loading Pyodide from CDN...");
      this._progress = {
        phase: "downloading",
        message: "Downloading Pyodide runtime...",
      };      // Load Pyodide using fetch (ES module compatible)
      console.log("Loading Pyodide via fetch...");
      
      // Fetch and evaluate the Pyodide script
      const response = await fetch("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");
      if (!response.ok) {
        throw new Error(`Failed to fetch Pyodide: ${response.statusText}`);
      }
      
      const pyodideCode = await response.text();
      
      // Execute the code in the global scope
      // This is the ES module equivalent of importScripts
      const func = new Function(pyodideCode);
      func.call(globalThis);
      
      // Now loadPyodide should be available
      const globalScope = globalThis as unknown as { loadPyodide?: (options?: {
        indexURL?: string;
      }) => Promise<PyodideInterface> };
      
      const loadPyodide = globalScope.loadPyodide;
      if (!loadPyodide) {
        throw new Error(
          "Failed to load Pyodide - loadPyodide function not available"
        );
      }

      this._pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
        // stdout: (text: string) => console.log("Python stdout:", text),
        // stderr: (text: string) => console.error("Python stderr:", text),
      });

      this._progress = {
        phase: "extracting",
        message: "Installing base packages...",
      };

      // Install essential packages
      await this._pyodide.loadPackage(["micropip"]);

      // Inject Desktop API bridge
      await this._setupDesktopApiBridge();

      this._progress = {
        phase: "ready",
        message: "Pyodide ready for Python execution",
      };
      this._isLoading = false;

      console.log("Pyodide initialized successfully");
      return { status: "success", message: "Pyodide initialized" };
    } catch (error) {
      this._isLoading = false;
      this._progress = null;
      console.error("Failed to initialize Pyodide:", error);
      return {
        status: "error",
        message: `Failed to initialize Pyodide: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  },

  /**
   * Setup the Desktop API bridge in Python context
   */
  async _setupDesktopApiBridge(): Promise<void> {
    if (!this._pyodide) throw new Error("Pyodide not initialized");

    // Inject the desktop module into Python namespace
    const desktopApiCode = `
import js
from pyodide.ffi import create_proxy
import json

class DesktopAPI:
    """Python interface to Desktop Dreamscape APIs"""
    
    @staticmethod
    def list_components():
        """List all available API components"""
        # This will be connected to the actual API registry via postMessage
        return js.desktop_api_bridge.list_components()
    
    @staticmethod 
    def execute(component_id, action, params=None):
        """Execute an action on a component"""
        if params is None:
            params = {}
        return js.desktop_api_bridge.execute(component_id, action, params)
    
    @staticmethod
    def subscribe_event(event_name, callback):
        """Subscribe to EventBus events"""
        proxy_callback = create_proxy(callback)
        return js.desktop_api_bridge.subscribe_event(event_name, proxy_callback)

class Events:
    """EventBus integration"""
    
    @staticmethod
    def emit(event_name, data=None):
        """Emit an event to the desktop EventBus"""
        return js.desktop_api_bridge.emit_event(event_name, data)
    
    @staticmethod
    def subscribe(event_name, callback):
        """Subscribe to desktop events"""
        proxy_callback = create_proxy(callback)
        return js.desktop_api_bridge.subscribe_event(event_name, proxy_callback)

# Create the desktop module structure
class Desktop:
    api = DesktopAPI()
    events = Events()

# Make it available globally
desktop = Desktop()
`;

    await this._pyodide.runPython(desktopApiCode);
  },

  /**
   * Execute Python code and return result
   */
  async executePython(
    code: string,
    returnStdout: boolean = false
  ): Promise<PythonResult> {
    if (!this._pyodide) {
      return {
        success: false,
        error: "Pyodide not initialized. Call initPyodide() first.",
      };
    }

    try {
      let stdout = "";

      if (returnStdout) {
        // Capture stdout
        await this._pyodide.runPython(`
import sys
from io import StringIO
_stdout_capture = StringIO()
sys.stdout = _stdout_capture
`);
      }

      // Execute the user code
      const result = await this._pyodide.runPython(code);

      if (returnStdout) {
        // Get captured stdout
        stdout = await this._pyodide.runPython(`
_stdout_capture.getvalue()
`);

        // Restore stdout
        await this._pyodide.runPython(`
sys.stdout = sys.__stdout__
`);
      }

      return {
        success: true,
        result: result,
        stdout: returnStdout ? stdout : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Install Python packages using micropip
   */
  async installPackage(packageName: string): Promise<PythonResult> {
    if (!this._pyodide) {
      return {
        success: false,
        error: "Pyodide not initialized",
      };
    }

    try {
      await this._pyodide.runPython(`
import micropip
await micropip.install('${packageName}')
`);

      return {
        success: true,
        result: `Package ${packageName} installed successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to install ${packageName}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  },

  /**
   * Get current initialization progress
   */
  getProgress(): PyodideProgress | null {
    return this._progress;
  },

  /**
   * Check if Pyodide is ready
   */
  isReady(): boolean {
    return this._pyodide !== null && !this._isLoading;
  },

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this._pyodide) {
      // Pyodide doesn't have explicit cleanup, but we can clear references
      this._pyodide = null;
      this._progress = null;
      console.log("Pyodide worker cleaned up");
    }
  },

  /**
   * Generic handler function that processes method calls with parameters
   */
  handle(method: string, params?: Record<string, unknown>): unknown {
    switch (method) {
      case "initPyodide":
        return this.initPyodide();

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

      default:
        return { success: false, error: `Unknown method: ${method}` };
    }
  },
};

// Export the pyodide plugin instance as default
export default PyodideWorker;
