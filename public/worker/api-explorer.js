// Built worker plugin: api-explorer
// Generated on: 2025-05-20T17:42:05.253Z

// src/worker/plugins/api-explorer.ts
var apiExplorerWorker = {
  id: "api-explorer",
  /**
   * Example method that can be called from the UI
   */
  exampleMethod(param1, param2) {
    return {
      result: `Processed ${param1} with value ${param2}`
    };
  },
  /**
   * Generic handler function that processes method calls with parameters
   */
  handle(method, params) {
    switch (method) {
      case "exampleMethod": {
        if (!params || typeof params.param1 !== "string" || typeof params.param2 !== "number") {
          return { error: "Invalid parameters for exampleMethod" };
        }
        return this.exampleMethod(
          params.param1,
          params.param2
        );
      }
      default:
        return { error: `Method ${method} not supported for api-explorer` };
    }
  }
};
var api_explorer_default = apiExplorerWorker;
export {
  api_explorer_default as default
};
