# Worker Plugin System

This directory contains Worker plugins that run in a Web Worker context, allowing computationally intensive tasks to be offloaded from the main thread.

## Creating a New Worker Plugin

To create a new worker plugin, follow these steps:

1. Create a new file in this directory, e.g., `myPlugin.ts`
2. Implement the plugin following this template:

```typescript
/**
 * Worker-specific Plugin implementation that doesn't depend on React or DOM
 */

// Define the plugin interface (already exported from calculator.ts)
import { WorkerPlugin } from './calculator';

/**
 * Your plugin implementation
 */
const MyWorkerPlugin: WorkerPlugin = {
  id: "my-plugin", // Unique ID for your plugin
  
  // Custom methods your plugin provides
  myOperation(param1: string, param2: number): string {
    // Implement your functionality here
    return `Result: ${param1} ${param2}`;
  },
  
  /**
   * Generic handler function that processes method calls with parameters
   */
  handle(method: string, params?: Record<string, unknown>): unknown {
    if (method === "myOperation") {
      if (!params) {
        return { error: "Missing parameters for myOperation" };
      }
      
      // Type check parameters
      if (
        typeof params.param1 !== "string" ||
        typeof params.param2 !== "number" 
      ) {
        return { error: "Invalid parameters for myOperation" };
      }
      
      return this.myOperation(
        params.param1 as string,
        params.param2 as number
      );
    }
    
    return { error: `Method ${method} not supported` };
  }
};

// Export the plugin instance as default
export default MyWorkerPlugin;
```

3. Register your plugin from the client side with:

```typescript
// In your React component
import { workerPluginManager } from "../../WorkerPluginManagerClient";

useEffect(() => {
  const initPlugin = async () => {
    const success = await workerPluginManager.registerPlugin(
      "my-plugin", 
      "/worker/plugins/myPlugin.js"
    );
    
    if (success) {
      console.log("My plugin registered successfully");
    }
  };
  
  initPlugin();
}, []);

// Call your plugin methods
const result = await workerPluginManager.callPlugin(
  "my-plugin", 
  "myOperation", 
  { param1: "hello", param2: 42 }
);
```

## Plugin Requirements

- Plugins must export a default object that implements the `WorkerPlugin` interface
- Plugins cannot use DOM APIs or React
- All plugin methods must be serializable (can be transferred between threads)
- The plugin should handle its own method calls through the `handle` method
- If your plugin needs to transfer streams or other transferable objects, use `Comlink.transfer`

## Best Practices

1. Keep your worker plugin lightweight
2. Implement proper error handling
3. Use the handler pattern to standardize method calls
4. Include clear type checking for parameters
5. Return structured error objects instead of throwing exceptions 