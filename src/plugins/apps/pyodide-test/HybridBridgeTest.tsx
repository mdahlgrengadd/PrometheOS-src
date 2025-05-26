import React, { useState } from 'react';

import { workerPluginManager } from '../../WorkerPluginManagerClient';

/**
 * Component to test the hybrid bridge with both Comlink and MCP protocol
 */
export const HybridBridgeTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    result?: unknown;
    error?: string;
    stdout?: string;
  } | null>(null);

  // Test the Comlink direct API interface
  const testComlinkApi = async () => {
    setIsLoading(true);
    try {
      const pythonCode = `
import js
import asyncio

print("Testing direct Comlink API access...")

async def run_test():
    # 1. Test list_components via Comlink
    print("1. Testing list_components via Comlink...")
    components = await desktop.api.list_components()
    print(f"Components: {components}")

    # 2. Test execute via Comlink
    print("2. Testing execute via Comlink...")
    calc_result = await desktop.api.execute("calculator", "add", {"a": 42, "b": 58})
    print(f"Calculator result: {calc_result}")

    # 3. Test event emission via Comlink
    print("3. Testing event emission via Comlink...")
    event_result = await desktop.events.emit("python_comlink_test", {"source": "comlink", "timestamp": "now"})
    print(f"Event emission result: {event_result}")

    print("Comlink API testing complete!")
    return "Comlink API test completed successfully"

# Create and run async function
result = asyncio.run(run_test())
result
`;

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

  // Test the MCP JSON-RPC 2.0 protocol
  const testMcpProtocol = async () => {
    setIsLoading(true);
    try {
      const pythonCode = `
import js
import asyncio

print("Testing MCP Protocol JSON-RPC 2.0 interface...")

async def run_test():
    # 1. Test tools/list endpoint
    print("1. Testing tools/list endpoint...")
    tools_result = await desktop.mcp.tools_list()
    print(f"Tools list result: {tools_result}")

    # 2. Test tools/call endpoint
    print("2. Testing tools/call endpoint...")
    call_result = await desktop.mcp.tools_call("calculator.add", {"a": 100, "b": 250})
    print(f"Tool call result: {call_result}")

    # 3. Test raw MCP message
    print("3. Testing raw MCP message...")
    raw_result = await desktop.mcp.send({
        "jsonrpc": "2.0",
        "method": "resources/list",
        "id": "test-resources"
    })
    print(f"Raw MCP message result: {raw_result}")

    print("MCP protocol testing complete!")
    return "MCP protocol test completed successfully"

# Create and run async function
result = asyncio.run(run_test())
result
`;

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

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm mb-6">
      <h2 className="text-xl font-bold mb-4">Hybrid Bridge Test</h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={testComlinkApi}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Testing..." : "Test Comlink API"}
        </button>

        <button
          onClick={testMcpProtocol}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? "Testing..." : "Test MCP Protocol"}
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

      <div className="text-sm text-gray-600">
        <p>
          This test demonstrates the hybrid Python-Desktop API Bridge that
          provides both:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>
            <strong>Comlink Interface</strong>: Direct, ergonomic API calls from
            Python with real return values
          </li>
          <li>
            <strong>MCP Protocol</strong>: Standards-compliant JSON-RPC 2.0
            message exchange for LLM function calling
          </li>
        </ul>
      </div>
    </div>
  );
};
