/**
 * Bridge setup functionality for connecting Python and JavaScript contexts
 */

import type { ExtendedPyodideInterface, WorkerPlugin } from "./types";
import { loadComlinkHelpers, loadPythonBridge } from "./python-loader";

export class BridgeSetup {
  private pyodide: ExtendedPyodideInterface;

  constructor(pyodide: ExtendedPyodideInterface) {
    this.pyodide = pyodide;
  }

  /**
   * Setup the Desktop API bridge in Python context
   * Now supports both Comlink (ergonomic) and postMessage (MCP) interfaces
   */
  async setupDesktopApiBridge(pluginInstance: WorkerPlugin): Promise<void> {
    console.log("Setting up Hybrid Desktop API bridge...");

    try {
      // Inject the desktop module into Python namespace with both interfaces
      // First, expose the current plugin instance to Python context
      this.pyodide.globals.set("_pyodide_plugin_instance", pluginInstance);

      // Also expose to globalThis for JavaScript access from Python
      (globalThis as Record<string, unknown>)._pyodide_plugin_instance =
        pluginInstance;

      // Load and execute the Python bridge code
      const desktopApiCode = await loadPythonBridge();
      await this.pyodide.runPython(desktopApiCode);

      console.log("Hybrid Desktop API bridge setup completed successfully");
    } catch (error) {
      console.error("Failed to setup Hybrid Desktop API bridge:", error);
      throw error;
    }
  }

  /**
   * Add Comlink helper methods to Python
   * This sets up better communication between Python and Comlink
   */
  async enhanceComlinkIntegration(): Promise<void> {
    console.log("Enhancing Python-Comlink integration...");

    try {
      // Load and execute the Comlink helpers
      const comlinkHelpersCode = await loadComlinkHelpers();
      await this.pyodide.runPython(comlinkHelpersCode);

      console.log("Python-Comlink integration enhanced successfully");
    } catch (error) {
      console.error("Failed to enhance Python-Comlink integration:", error);
      throw error;
    }
  }
}
