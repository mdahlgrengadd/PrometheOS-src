/**
 * Pyodide Worker Plugin - Python runtime in Web Worker
 * Follows the established worker plugin pattern from webllm.ts
 *
 * This is now a simple re-export of the refactored plugin
 */

import PyodideWorker from "./pyodide/index";

// Re-export types for backward compatibility
export type {
  PythonResult,
  PyodideProgress,
  PyodideInterface,
} from "./pyodide/types";

// Export the plugin as default
export default PyodideWorker;
