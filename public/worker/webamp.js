// Built worker plugin: webamp
// Generated on: 2025-05-20T12:45:30.687Z

// src/worker/plugins/webamp.ts
var webampWorker = {
  id: "webamp",
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
        return { error: `Method ${method} not supported for webamp` };
    }
  }
};
var webamp_default = webampWorker;
export {
  webamp_default as default
};
