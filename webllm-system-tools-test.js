/**
 * WebLLM System Tools Function Calling Test Script
 *
 * This script tests the WebLLM function calling implementation with actual system API tools.
 * Run this in the browser console when the application is loaded.
 */

// Logging function
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Test function calling with launcher tool notification
async function testNotificationTool() {
  log("🔔 Testing notification tool calling...");

  if (!window.workerPluginManager) {
    log("❌ WorkerPluginManager not available");
    return false;
  }

  try {
    const messages = [
      {
        role: "user",
        content:
          'Please show me a notification that says "Hello from WebLLM function calling!" using the launcher tool notify function.',
      },
    ];

    log("📤 Sending message with tool request...");
    const stream = await window.workerPluginManager.chatWithTools(messages);
    const reader = stream.getReader();
    let fullResponse = "";
    let toolCallFound = false;
    let toolExecuted = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      fullResponse += value;
      log(`📝 Response chunk: ${value}`);

      // Check for tool call patterns
      if (value.includes("<tool_call>") || value.includes("<function>")) {
        toolCallFound = true;
        log("✅ Tool call pattern detected");
      }

      // Check for tool execution indicators
      if (
        value.includes("Tool executed:") ||
        value.includes("Function executed:") ||
        value.includes("[Tool Result]")
      ) {
        toolExecuted = true;
        log("✅ Tool execution detected");
      }
    }

    log(`📄 Full response: ${fullResponse}`);

    if (toolCallFound && toolExecuted) {
      log("✅ Notification tool test passed");
      return true;
    } else {
      log("❌ Notification tool test failed - missing tool call or execution");
      return false;
    }
  } catch (error) {
    log(`❌ Error in notification tool test: ${error.message}`);
    return false;
  }
}

// Test function calling with event listing tool
async function testEventListingTool() {
  log("📋 Testing event listing tool calling...");

  if (!window.workerPluginManager) {
    log("❌ WorkerPluginManager not available");
    return false;
  }

  try {
    const messages = [
      {
        role: "user",
        content:
          "Can you list all the available events in the system using the event tool?",
      },
    ];

    log("📤 Sending message with event listing request...");
    const stream = await window.workerPluginManager.chatWithTools(messages);
    const reader = stream.getReader();
    let fullResponse = "";
    let toolCallFound = false;
    let toolExecuted = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      fullResponse += value;
      log(`📝 Response chunk: ${value}`);

      // Check for tool call patterns
      if (value.includes("<tool_call>") || value.includes("<function>")) {
        toolCallFound = true;
        log("✅ Tool call pattern detected");
      }

      // Check for tool execution indicators
      if (
        value.includes("Tool executed:") ||
        value.includes("Function executed:") ||
        value.includes("[Tool Result]")
      ) {
        toolExecuted = true;
        log("✅ Tool execution detected");
      }
    }

    log(`📄 Full response: ${fullResponse}`);

    if (toolCallFound && toolExecuted) {
      log("✅ Event listing tool test passed");
      return true;
    } else {
      log("❌ Event listing tool test failed - missing tool call or execution");
      return false;
    }
  } catch (error) {
    log(`❌ Error in event listing tool test: ${error.message}`);
    return false;
  }
}

// Test multiple tool calls in sequence
async function testMultipleToolCalls() {
  log("🔧 Testing multiple tool calls...");

  if (!window.workerPluginManager) {
    log("❌ WorkerPluginManager not available");
    return false;
  }

  try {
    const messages = [
      {
        role: "user",
        content:
          'Please do these things in order: 1) List all available events using the event tool, 2) Show a notification saying "Multiple tools work!" using the launcher tool notify function',
      },
    ];

    log("📤 Sending message with multiple tool requests...");
    const stream = await window.workerPluginManager.chatWithTools(messages);
    const reader = stream.getReader();
    let fullResponse = "";
    let toolCallCount = 0;
    let toolExecutionCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      fullResponse += value;
      log(`📝 Response chunk: ${value}`);

      // Count tool call patterns
      const toolCallMatches = value.match(/<tool_call>|<function>/g);
      if (toolCallMatches) {
        toolCallCount += toolCallMatches.length;
      }

      // Count tool execution indicators
      const toolExecMatches = value.match(
        /Tool executed:|Function executed:|\[Tool Result\]/g
      );
      if (toolExecMatches) {
        toolExecutionCount += toolExecMatches.length;
      }
    }

    log(`📄 Full response: ${fullResponse}`);
    log(
      `🔢 Tool calls found: ${toolCallCount}, Tool executions: ${toolExecutionCount}`
    );

    if (toolCallCount >= 2 && toolExecutionCount >= 2) {
      log("✅ Multiple tool calls test passed");
      return true;
    } else {
      log(
        "❌ Multiple tool calls test failed - insufficient tool calls or executions"
      );
      return false;
    }
  } catch (error) {
    log(`❌ Error in multiple tool calls test: ${error.message}`);
    return false;
  }
}

// Test dialog tool
async function testDialogTool() {
  log("💬 Testing dialog tool calling...");

  if (!window.workerPluginManager) {
    log("❌ WorkerPluginManager not available");
    return false;
  }

  try {
    const messages = [
      {
        role: "user",
        content:
          'Please show a dialog asking "Do you want to continue testing?" with "Yes" and "No" buttons using the dialog tool.',
      },
    ];

    log("📤 Sending message with dialog request...");
    const stream = await window.workerPluginManager.chatWithTools(messages);
    const reader = stream.getReader();
    let fullResponse = "";
    let toolCallFound = false;
    let toolExecuted = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      fullResponse += value;
      log(`📝 Response chunk: ${value}`);

      // Check for tool call patterns
      if (value.includes("<tool_call>") || value.includes("<function>")) {
        toolCallFound = true;
        log("✅ Tool call pattern detected");
      }

      // Check for tool execution indicators
      if (
        value.includes("Tool executed:") ||
        value.includes("Function executed:") ||
        value.includes("[Tool Result]")
      ) {
        toolExecuted = true;
        log("✅ Tool execution detected");
      }
    }

    log(`📄 Full response: ${fullResponse}`);

    if (toolCallFound && toolExecuted) {
      log("✅ Dialog tool test passed");
      return true;
    } else {
      log("❌ Dialog tool test failed - missing tool call or execution");
      return false;
    }
  } catch (error) {
    log(`❌ Error in dialog tool test: ${error.message}`);
    return false;
  }
}

// Check WebLLM worker status
async function checkSystemStatus() {
  log("🔍 Checking system status...");

  try {
    if (!window.workerPluginManager) {
      log("❌ WorkerPluginManager not available");
      return false;
    }

    // Check if WebLLM worker is ready
    const isReady = await window.workerPluginManager.callPlugin(
      "webllm",
      "isReady"
    );
    log(`WebLLM Ready: ${isReady}`);

    // Check current model
    const currentModel = await window.workerPluginManager.callPlugin(
      "webllm",
      "getCurrentModel"
    );
    log(`Current Model: ${currentModel}`);

    // Check function calling support
    const supportsFunctions = await window.workerPluginManager.callPlugin(
      "webllm",
      "supportsFunctionCalling"
    );
    log(`Supports Function Calling: ${supportsFunctions}`);

    if (!isReady) {
      log("⚠️ WebLLM worker is not ready. Please load a model first.");
      return false;
    }

    if (!supportsFunctions) {
      log(
        "⚠️ Current model does not support function calling. Load a Hermes or Llama 3.1 model."
      );
      return false;
    }

    log("✅ System is ready for function calling tests");
    return true;
  } catch (error) {
    log(`❌ Error checking system status: ${error.message}`);
    return false;
  }
}

// Run all tests in sequence
async function runAllSystemToolTests() {
  log("🚀 Starting comprehensive system tool tests...");

  // First check system status
  const systemReady = await checkSystemStatus();
  if (!systemReady) {
    log("❌ System not ready for testing");
    return;
  }

  // Run individual tests
  const tests = [
    { name: "Notification Tool", fn: testNotificationTool },
    { name: "Event Listing Tool", fn: testEventListingTool },
    { name: "Dialog Tool", fn: testDialogTool },
    { name: "Multiple Tool Calls", fn: testMultipleToolCalls },
  ];

  const results = [];

  for (const test of tests) {
    log(`\n🧪 Running ${test.name} test...`);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      if (result) {
        log(`✅ ${test.name} test PASSED`);
      } else {
        log(`❌ ${test.name} test FAILED`);
      }
    } catch (error) {
      log(`❌ ${test.name} test ERROR: ${error.message}`);
      results.push({ name: test.name, passed: false, error: error.message });
    }

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Summary
  log("\n📊 Test Results Summary:");
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  log(`Passed: ${passed}/${total}`);

  results.forEach((result) => {
    const status = result.passed ? "✅" : "❌";
    const error = result.error ? ` (${result.error})` : "";
    log(`${status} ${result.name}${error}`);
  });

  if (passed === total) {
    log(
      "🎉 All system tool tests passed! WebLLM function calling is working correctly."
    );
  } else {
    log("⚠️ Some tests failed. Check the logs above for details.");
  }
}

// Make functions available globally for manual testing
window.testNotificationTool = testNotificationTool;
window.testEventListingTool = testEventListingTool;
window.testMultipleToolCalls = testMultipleToolCalls;
window.testDialogTool = testDialogTool;
window.checkSystemStatus = checkSystemStatus;
window.runAllSystemToolTests = runAllSystemToolTests;

log("🔧 WebLLM System Tools Test Functions Loaded");
log("Available functions:");
log("  - checkSystemStatus() - Check if system is ready for testing");
log("  - testNotificationTool() - Test notification function");
log("  - testEventListingTool() - Test event listing function");
log("  - testDialogTool() - Test dialog function");
log("  - testMultipleToolCalls() - Test multiple tool calls");
log("  - runAllSystemToolTests() - Run all tests in sequence");
log("");
log("💡 To start testing, run: runAllSystemToolTests()");
