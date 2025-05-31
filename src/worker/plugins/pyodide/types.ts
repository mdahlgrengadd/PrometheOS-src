/**
 * Type definitions for Pyodide Worker Plugin
 */

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

// Worker plugin interface for compute-intensive tasks
export interface WorkerPlugin {
  id: string;
  handle?: (method: string, params?: Record<string, unknown>) => unknown;
  [key: string]: unknown;
}

// Basic Pyodide interface (compatible with existing global declarations)
export interface PyodideInterface {
  globals: {
    set(name: string, value: unknown): void;
    get(name: string): unknown;
  };
  runPythonAsync(code: string): Promise<unknown>;
  loadPackage(packages: string | string[]): Promise<void>;
}

// Extended Pyodide interface for our plugin's needs
export interface ExtendedPyodideInterface extends PyodideInterface {
  runPython(code: string): unknown;
  FS: {
    writeFile(path: string, data: string | Uint8Array): void;
    readFile(
      path: string,
      options?: { encoding?: string }
    ): string | Uint8Array;
  };
}
