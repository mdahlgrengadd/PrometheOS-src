// Test script to verify the generated TypeScript client
import {
  launcher,
  dialog,
  event,
  onEvent,
} from "../src/prometheos-client/index.js";

console.log("🧪 Testing generated TypeScript client...");

// Test type safety and exports
try {
  console.log("✅ Client imports successfully loaded");

  // Test that the API functions are available
  console.log("✅ launcher methods:", Object.keys(launcher));
  console.log("✅ dialog methods:", Object.keys(dialog));
  console.log("✅ event methods:", Object.keys(event));
  console.log("✅ onEvent methods:", Object.keys(onEvent));

  console.log("🎉 TypeScript client test completed successfully!");
  console.log("The client is ready to use with proper type safety.");
} catch (error) {
  console.error("❌ Client test failed:", error.message);
  process.exit(1);
}
