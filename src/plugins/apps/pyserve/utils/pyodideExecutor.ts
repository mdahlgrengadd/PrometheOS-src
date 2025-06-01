// Utility for executing Python functions with stdout capture
interface PyodideInterface {
  globals: {
    set(name: string, value: unknown): void;
    get(name: string): unknown;
  };
  runPythonAsync(code: string): Promise<unknown>;
  loadPackage(packages: string[]): Promise<void>;
}

interface PyodideExecutionResult {
  result: unknown;
  stdout: string;
  error?: string;
}

interface ExecutionResultFormatted {
  result?: unknown;
  stdout?: string;
  error?: string;
  type:
    | "success_with_output"
    | "function_result"
    | "error"
    | "error_with_output";
}

export const executePythonFunction = async (
  pyodide: PyodideInterface,
  functionName: string,
  parameters: Record<string, unknown> = {}
): Promise<PyodideExecutionResult> => {
  if (!pyodide) {
    throw new Error("Pyodide not initialized");
  }

  let stdout = "";
  let result: unknown = null;
  let error: string | undefined;

  try {
    // Set up stdout capture
    await pyodide.runPythonAsync(`
import sys
import io
from contextlib import redirect_stdout

# Create a string buffer to capture stdout
_stdout_buffer = io.StringIO()
`);

    // Set parameters in Pyodide globals
    Object.entries(parameters).forEach(([key, value]) => {
      pyodide.globals.set(key, value);
    });

    // Prepare function call
    const paramNames = Object.keys(parameters);
    const callString =
      paramNames.length > 0
        ? `${functionName}(${paramNames.join(", ")})`
        : `${functionName}()`; // Execute function with stdout capture - capture both success and error cases
    const executionCode = `
_result = None
_error = None
_captured_stdout = ""

try:
    with redirect_stdout(_stdout_buffer):
        _result = ${callString}
except Exception as e:
    import traceback
    _error = traceback.format_exc()
finally:
    # Always capture stdout, even if there was an error
    _captured_stdout = _stdout_buffer.getvalue()
    _stdout_buffer.close()

# Return result, stdout, and error (if any)
(_result, _captured_stdout, _error)
`;
    console.log(`Executing with stdout capture: ${callString}`);
    const [functionResult, capturedStdout, executionError] =
      (await pyodide.runPythonAsync(executionCode)) as [
        unknown,
        string,
        string | null
      ];

    // Handle the execution error if it occurred
    if (executionError) {
      error = executionError;
    }
    // Convert result to JavaScript only if there was no error
    if (
      !error &&
      functionResult &&
      typeof functionResult === "object" &&
      "toJs" in functionResult &&
      typeof functionResult.toJs === "function"
    ) {
      result = functionResult.toJs();
    } else if (!error) {
      result = functionResult;
    }

    stdout = capturedStdout || "";

    if (error) {
      console.error(`Error executing ${functionName}:`, error);
      console.log(`Captured stdout during error:`, stdout);
    } else {
      console.log(
        `Function ${functionName} executed successfully. Result:`,
        result,
        "Stdout:",
        stdout
      );
    }
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : "Unknown error occurred";
    console.error(`Error executing ${functionName}:`, err);
  }

  return {
    result,
    stdout,
    error,
  };
};

export const formatExecutionResult = (
  executionResult: PyodideExecutionResult
): ExecutionResultFormatted => {
  const { result, stdout, error } = executionResult;

  if (error) {
    // If there's stdout output even during an error, include it
    if (stdout && stdout.trim()) {
      return {
        error: error,
        stdout: stdout.trim(),
        type: "error_with_output",
      };
    }
    return {
      error: error,
      type: "error",
    };
  }
  // If we have both result and stdout, return both
  if (stdout.trim()) {
    return {
      result: result, // Always show the actual return value (including None)
      stdout: stdout.trim(),
      type: "success_with_output",
    };
  }

  // Function completed successfully with no stdout
  return {
    result: result,
    type: "function_result",
  };
};
