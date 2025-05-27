/**
 * WebLLM Function Calling Test Script
 *
 * This script tests the WebLLM function calling implementation.
 * Run this in the browser console when the application is loaded.
 */

async function testWebLLMFunctionCalling() {
  console.log("🧪 Starting WebLLM Function Calling Test");

  // Test data
  const testTools = [
    {
      type: "function",
      function: {
        name: "get_weather",
        description: "Get the current weather for a location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: {
              type: "string",
              enum: ["celsius", "fahrenheit"],
              description: "The temperature unit",
            },
          },
          required: ["location"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate",
        description: "Perform a mathematical calculation",
        parameters: {
          type: "object",
          properties: {
            expression: {
              type: "string",
              description: "The mathematical expression to evaluate",
            },
          },
          required: ["expression"],
        },
      },
    },
  ];

  const testMessages = [
    {
      role: "system",
      content:
        "You are a helpful assistant with access to weather and calculation tools.",
    },
    {
      role: "user",
      content: "What's the weather like in New York and what's 25 + 17?",
    },
  ];

  try {
    // Check if WebLLM worker is available
    if (!window.workerPluginManager) {
      throw new Error("WorkerPluginManager not available");
    }

    console.log("✅ WorkerPluginManager found");

    // Test 1: Check if WebLLM plugin supports function calling
    console.log("\n📋 Test 1: Checking function calling support");

    const supportsFunctionCalling = await window.workerPluginManager.callPlugin(
      "webllm",
      "supportsFunctionCalling"
    );

    console.log(`Function calling support: ${supportsFunctionCalling}`);

    if (!supportsFunctionCalling) {
      console.warn(
        "⚠️ Current model doesn't support function calling. Load a Hermes or Llama 3.1 model first."
      );
      return;
    }

    // Test 2: Get current model
    console.log("\n📋 Test 2: Getting current model");
    const currentModel = await window.workerPluginManager.callPlugin(
      "webllm",
      "getCurrentModel"
    );
    console.log(`Current model: ${currentModel}`); // Test 3: Test function calling
    console.log("\n📋 Test 3: Testing function calling");
    console.log("Sending messages with tools...");

    const startTime = Date.now();

    // Use the correct API - chatWithTools returns a ReadableStream
    const responseStream = await window.workerPluginManager.chatWithTools(
      testMessages,
      0.7
    );

    const endTime = Date.now();
    console.log(`Response stream received in ${endTime - startTime}ms`);

    // Read from the stream
    const reader = responseStream.getReader();
    let fullResponse = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += value;
        console.log("Stream chunk:", value);
      }
    } finally {
      reader.releaseLock();
    }

    console.log("Full response:", fullResponse); // Test 4: Check response format
    console.log("\n📋 Test 4: Validating response format");

    // Check if the response contains tool calls or function calls
    if (fullResponse) {
      console.log("✅ Response received");

      // Check for Hermes tool call format
      if (
        fullResponse.includes("<tool_call>") &&
        fullResponse.includes("</tool_call>")
      ) {
        console.log("✅ Hermes tool call format detected");
      }

      // Check for Llama 3.1 function call format
      if (
        fullResponse.includes("<function>") &&
        fullResponse.includes("</function>")
      ) {
        console.log("✅ Llama 3.1 function call format detected");
      }

      // Check for tool execution indicators
      if (
        fullResponse.includes("[Executing tool:") ||
        fullResponse.includes("[Executing function:")
      ) {
        console.log("✅ Tool execution detected");
      }

      if (
        fullResponse.includes("[Tool Result]:") ||
        fullResponse.includes("[Function Result]:")
      ) {
        console.log("✅ Tool result received");
      }

      if (fullResponse.includes("[Assistant response]:")) {
        console.log("✅ Assistant response after tool execution detected");
      }
    } else {
      console.log("❌ No response received");
    }

    console.log("\n🎉 WebLLM Function Calling Test Complete!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Stack trace:", error.stack);
  }
}

// Helper function to test with a simple calculator call
async function testSimpleCalculation() {
  console.log("🧮 Testing simple calculation with WebLLM");

  const messages = [
    {
      role: "system",
      content:
        "You are a calculator assistant. Use the available tools for any math.",
    },
    { role: "user", content: "What is 15 * 8?" },
  ];

  try {
    // Use chatWithTools which will automatically enable tools if supported
    const responseStream = await window.workerPluginManager.chatWithTools(
      messages,
      0.7
    );

    // Read from the stream
    const reader = responseStream.getReader();
    let fullResponse = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += value;
        console.log("Stream chunk:", value);
      }
    } finally {
      reader.releaseLock();
    }

    console.log("Simple calculation response:", fullResponse);
    return fullResponse;
  } catch (error) {
    console.error("Simple calculation failed:", error);
    throw error;
  }
}

// Helper function to check worker status
async function checkWorkerStatus() {
  console.log("🔍 Checking WebLLM worker status");

  try {
    const isReady = await window.workerPluginManager.callPlugin(
      "webllm",
      "isReady"
    );
    const currentModel = await window.workerPluginManager.callPlugin(
      "webllm",
      "getCurrentModel"
    );
    const supportsFunctions = await window.workerPluginManager.callPlugin(
      "webllm",
      "supportsFunctionCalling"
    );

    console.log("Worker Status:");
    console.log(`  Ready: ${isReady}`);
    console.log(`  Current Model: ${currentModel}`);
    console.log(`  Supports Function Calling: ${supportsFunctions}`);

    return { isReady, currentModel, supportsFunctions };
  } catch (error) {
    console.error("Failed to check worker status:", error);
    throw error;
  }
}

// Make functions available globally for manual testing
window.testWebLLMFunctionCalling = testWebLLMFunctionCalling;
window.testSimpleCalculation = testSimpleCalculation;
window.checkWorkerStatus = checkWorkerStatus;

console.log("🔧 WebLLM Function Calling Test Functions Loaded");
console.log("Available functions:");
console.log("  - testWebLLMFunctionCalling() - Full test suite");
console.log("  - testSimpleCalculation() - Simple calculator test");
console.log("  - checkWorkerStatus() - Check worker and model status");
