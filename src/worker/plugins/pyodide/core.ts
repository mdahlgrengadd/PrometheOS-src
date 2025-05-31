/**
 * Core Pyodide functionality - initialization and basic operations
 */

import type {
  ExtendedPyodideInterface,
  PyodideProgress,
  PythonResult,
  PyodideInterface,
} from "./types";

export class PyodideCore {
  private _pyodide: ExtendedPyodideInterface | null = null;
  private _isLoading = false;
  private _progress: PyodideProgress | null = null;

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
      };

      console.log("Loading Pyodide via fetch...");

      // Fetch and evaluate the Pyodide script
      const response = await fetch(
        "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"
      );
      if (!response.ok) {
        throw new Error(`Failed to load Pyodide: ${response.statusText}`);
      }

      const pyodideCode = await response.text();

      // Execute the code in the global scope
      // This is the ES module equivalent of importScripts
      const func = new Function(pyodideCode);
      func.call(globalThis); // Now loadPyodide should be available
      const globalScope = globalThis as unknown as Window;

      const loadPyodide = globalScope.loadPyodide;
      if (!loadPyodide) {
        throw new Error("loadPyodide not available after loading script");
      }

      const basePyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
      });

      // Cast the basic PyodideInterface to our ExtendedPyodideInterface
      // The global loadPyodide returns a PyodideInterface but it actually has more methods
      this._pyodide = basePyodide as unknown as ExtendedPyodideInterface;

      this._progress = {
        phase: "extracting",
        message: "Installing base packages...",
      };

      // Install essential packages
      await this._pyodide.loadPackage(["micropip"]);

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
  }

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
      } // Execute the user code, using runPythonAsync if available
      let result: unknown;
      if (typeof this._pyodide.runPythonAsync === "function") {
        result = await this._pyodide.runPythonAsync(code);
      } else if (typeof this._pyodide.runPython === "function") {
        result = this._pyodide.runPython(code);
      } else {
        throw new Error("Neither runPython nor runPythonAsync is available");
      }
      if (returnStdout) {
        // Get captured stdout
        const stdoutResult = await this._pyodide.runPython(`
_stdout_capture.getvalue()
`);
        stdout = String(stdoutResult);

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
  }

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
  }

  /**
   * Get current initialization progress
   */
  getProgress(): PyodideProgress | null {
    return this._progress;
  }

  /**
   * Check if Pyodide is ready
   */
  isReady(): boolean {
    return this._pyodide !== null && !this._isLoading;
  }
  /**
   * Get the Pyodide instance
   */
  getPyodide(): ExtendedPyodideInterface | null {
    return this._pyodide;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this._pyodide) {
      // Pyodide doesn't have explicit cleanup, but we can clear references
      this._pyodide = null;
      this._progress = null;
      console.log("Pyodide core cleaned up");
    }
  }
}
