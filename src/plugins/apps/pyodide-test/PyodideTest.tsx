/**
 * Pyodide Test Component - Verify basic Python execution
 * This is a simple test to ensure Pyodide integration works
 */

import React, { useEffect, useState } from "react";

import { workerPluginManager } from "../../WorkerPluginManagerClient";

export const PyodideTest: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string>("Not started");
  const [pythonCode, setPythonCode] = useState(
    'print("Hello from Python!")\n2 + 2'
  );
  const [result, setResult] = useState<{
    success: boolean;
    result?: unknown;
    error?: string;
    stdout?: string;
  } | null>(null);

  // Initialize Pyodide
  const initPyodide = async () => {
    setIsLoading(true);
    setProgress("Initializing Pyodide...");

    try {
      const result = await workerPluginManager.initPyodide();

      if (result.status === "success") {
        setIsInitialized(true);
        setProgress("Pyodide ready!");
      } else {
        setProgress(`Error: ${result.message}`);
      }
    } catch (error) {
      setProgress(
        `Failed to initialize: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Execute Python code
  const executePython = async () => {
    if (!isInitialized) {
      alert("Please initialize Pyodide first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await workerPluginManager.executePython(pythonCode, true);
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check Pyodide status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const ready = await workerPluginManager.isPyodideReady();
      setIsInitialized(ready);
      if (ready) {
        setProgress("Pyodide already ready!");
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Pyodide Integration Test</h2>

      {/* Status Section */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        <div className="flex items-center gap-4">
          <div
            className={`w-3 h-3 rounded-full ${
              isInitialized ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm">{progress}</span>
          {!isInitialized && (
            <button
              onClick={initPyodide}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? "Initializing..." : "Initialize Pyodide"}
            </button>
          )}
        </div>
      </div>

      {/* Python Code Editor */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Python Code</h3>
        <textarea
          value={pythonCode}
          onChange={(e) => setPythonCode(e.target.value)}
          className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
          placeholder="Enter Python code here..."
          disabled={!isInitialized}
        />
        <button
          onClick={executePython}
          disabled={!isInitialized || isLoading}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? "Executing..." : "Execute Python"}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Results</h3>
          <div
            className={`p-4 border rounded-lg ${
              result.success
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            <div className="mb-2">
              <strong>Success:</strong> {result.success ? "Yes" : "No"}
            </div>

            {result.stdout && (
              <div className="mb-2">
                <strong>Output:</strong>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
                  {result.stdout}
                </pre>
              </div>
            )}

            {result.result !== undefined && (
              <div className="mb-2">
                <strong>Return Value:</strong>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            )}

            {result.error && (
              <div className="mb-2">
                <strong>Error:</strong>
                <pre className="mt-1 p-2 bg-red-100 rounded text-sm overflow-x-auto">
                  {result.error}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Examples */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Test Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setPythonCode('print("Hello from Python!")\n2 + 2')}
            className="p-3 border rounded-lg text-left hover:bg-gray-50"
          >
            <div className="font-semibold">Basic Math</div>
            <div className="text-sm text-gray-600">
              Simple arithmetic and output
            </div>
          </button>

          <button
            onClick={() =>
              setPythonCode(
                'import json\ndata = {"message": "Hello from Python", "numbers": [1, 2, 3]}\njson.dumps(data, indent=2)'
              )
            }
            className="p-3 border rounded-lg text-left hover:bg-gray-50"
          >
            <div className="font-semibold">JSON Processing</div>
            <div className="text-sm text-gray-600">Test JSON manipulation</div>
          </button>

          <button
            onClick={() =>
              setPythonCode(
                '# This will test desktop API bridge when implemented\n# desktop.api.list_components()\nprint("Desktop API bridge not yet implemented")'
              )
            }
            className="p-3 border rounded-lg text-left hover:bg-gray-50"
          >
            <div className="font-semibold">Desktop API Bridge</div>
            <div className="text-sm text-gray-600">
              Future: Call desktop APIs
            </div>
          </button>

          <button
            onClick={() =>
              setPythonCode(
                'for i in range(5):\n    print(f"Count: {i}")\n\nresult = sum(range(10))\nprint(f"Sum of 0-9: {result}")\nresult'
              )
            }
            className="p-3 border rounded-lg text-left hover:bg-gray-50"
          >
            <div className="font-semibold">Loops & Variables</div>
            <div className="text-sm text-gray-600">Test control flow</div>
          </button>
        </div>
      </div>
    </div>
  );
};
