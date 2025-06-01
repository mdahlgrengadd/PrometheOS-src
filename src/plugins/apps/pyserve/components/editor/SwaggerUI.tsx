import "swagger-ui-react/swagger-ui.css";

import { FileQuestion } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import SwaggerUI from "swagger-ui-react";

import {
  executePythonFunction,
  formatExecutionResult,
} from "../../utils/pyodideExecutor";

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths?: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
  };
  servers?: Array<{
    url: string;
    description: string;
  }>;
}

interface PyodideInterface {
  globals: {
    set(name: string, value: unknown): void;
    get(name: string): unknown;
  };
  runPythonAsync(code: string): Promise<unknown>;
  loadPackage(packages: string[]): Promise<void>;
}

interface SwaggerUIComponentProps {
  openApiSpec: OpenAPISpec | null;
  pyodide: PyodideInterface | null;
}

const SwaggerUIComponent: React.FC<SwaggerUIComponentProps> = ({
  openApiSpec,
  pyodide,
}) => {
  // Create a mock server that executes functions with Pyodide
  const enhancedSpec: OpenAPISpec | null = useMemo(() => {
    if (!openApiSpec) return null;

    return {
      ...openApiSpec,
      servers: [
        {
          url: "/pyodide-api",
          description: "Pyodide Runtime (Live Execution)",
        },
      ],
    };
  }, [openApiSpec]);

  // Set up custom fetch for Swagger UI
  useEffect(() => {
    const originalFetch = window.fetch;

    // Custom fetch that intercepts API calls and executes them with Pyodide
    window.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();

      // Check if this is a request to our mock API
      if (url.includes("/pyodide-api/")) {
        const pathMatch = url.match(/\/pyodide-api\/(.+)$/);
        if (pathMatch && pyodide) {
          const functionName = pathMatch[1];
          try {
            // Parse the request body to get parameters
            let requestBody = {};
            if (init?.body) {
              try {
                requestBody = JSON.parse(init.body.toString());
              } catch (e) {
                console.warn("Failed to parse request body:", e);
              }
            }

            console.log(
              `Executing ${functionName} with parameters:`,
              requestBody
            );
            // Execute function with stdout capture
            const executionResult = await executePythonFunction(
              pyodide,
              functionName,
              requestBody
            );
            const formattedResult = formatExecutionResult(executionResult);

            console.log(
              `Function ${functionName} execution completed:`,
              formattedResult
            );
            // Format the response for better readability in Swagger UI
            let responseData;
            if (formattedResult.type === "success_with_output") {
              // For results with stdout, provide both structured and formatted stdout
              responseData = {
                type: formattedResult.type,
                result: formattedResult.result,
                stdout: formattedResult.stdout
                  ? formattedResult.stdout.split("\n")
                  : [],
              };
            } else if (formattedResult.type === "error_with_output") {
              // For errors with output, include both error and stdout
              responseData = {
                type: formattedResult.type,
                error: formattedResult.error,
                stdout: formattedResult.stdout
                  ? formattedResult.stdout.split("\n")
                  : [],
              };
            } else {
              // For simple results or errors, use the original format
              responseData = formattedResult;
            }

            // Create a successful Response object
            const responseBody = JSON.stringify(responseData, null, 2);
            return new Response(responseBody, {
              status: 200,
              statusText: "OK",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            });
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            console.error("Pyodide execution error:", errorMessage);

            // Create an error Response object
            const errorBody = JSON.stringify(
              {
                error: errorMessage,
                type: "PythonExecutionError",
              },
              null,
              2
            );

            return new Response(errorBody, {
              status: 500,
              statusText: "Internal Server Error",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            });
          }
        }
      }

      // For all other requests, use the original fetch
      return originalFetch(input, init);
    };

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [pyodide]);

  if (!enhancedSpec) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900 rounded-lg">
        <FileQuestion className="h-16 w-16 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          No API Documentation
        </h3>
        <p className="text-slate-400">
          Upload a Python file to generate interactive API documentation
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-lg overflow-hidden">
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-4 text-slate-400 text-sm font-mono">
            swagger-ui.html
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-green-400 text-xs">
            🚀 Live Execution Enabled
          </span>
        </div>
      </div>

      <div className="h-[calc(100%-48px)] overflow-auto">
        <SwaggerUI
          spec={enhancedSpec}
          tryItOutEnabled={true}
          supportedSubmitMethods={["post"]}
          defaultModelsExpandDepth={2}
          defaultModelExpandDepth={2}
          docExpansion="list"
          filter={false}
          showExtensions={true}
          showCommonExtensions={true}
          deepLinking={true}
          displayOperationId={true}
          defaultModelRendering="example"
          onComplete={() => {
            console.log(
              "Swagger UI loaded successfully with Pyodide integration"
            );
          }}
        />
      </div>

      <div className="absolute bottom-4 right-4 max-w-sm">
        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 backdrop-blur-sm">
          <div className="flex items-center space-x-2 text-green-300 text-sm">
            <span className="font-medium">✨ Try It Out:</span>
          </div>
          <ul className="mt-1 text-xs text-green-200 space-y-1">
            <li>• Click "Try it out" on any endpoint</li>
            <li>• Fill in parameters and execute</li>
            <li>• See live Python function results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SwaggerUIComponent;
