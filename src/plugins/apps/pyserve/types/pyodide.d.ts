
declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
    pyodide: PyodideInterface;
  }
}

interface PyodideInterface {
  globals: {
    set(name: string, value: any): void;
    get(name: string): any;
  };
  runPythonAsync(code: string): Promise<any>;
  loadPackage(packages: string[]): Promise<void>;
}

export {};
