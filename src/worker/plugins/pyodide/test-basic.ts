/**
 * Basic test for the refactored Pyodide plugin
 */

import PyodideWorker from "./index";

export async function testPyodidePlugin() {
  console.log("Testing refactored Pyodide plugin...");

  try {
    // Test initialization
    const initResult = await PyodideWorker.initPyodide();
    console.log("Init result:", initResult);

    if (initResult.status !== "success") {
      throw new Error(`Initialization failed: ${initResult.message}`);
    }

    // Test basic Python execution
    const execResult = await PyodideWorker.executePython(
      'print("Hello from refactored Pyodide!")'
    );
    console.log("Execution result:", execResult);

    if (!execResult.success) {
      throw new Error(`Execution failed: ${execResult.error}`);
    }

    // Test Python computation
    const mathResult = await PyodideWorker.executePython("2 + 3 * 4");
    console.log("Math result:", mathResult);

    if (!mathResult.success || mathResult.result !== 14) {
      throw new Error("Math computation failed");
    }

    console.log("✅ All basic tests passed!");
    return { success: true, message: "Refactored plugin working correctly" };
  } catch (error) {
    console.error("❌ Test failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

// Auto-run test if this is the main module (for development)
if (typeof window === "undefined" && typeof self !== "undefined") {
  // We're in a worker context - run the test
  setTimeout(() => {
    testPyodidePlugin().then((result) => {
      console.log("Test completed:", result);
    });
  }, 1000);
}
