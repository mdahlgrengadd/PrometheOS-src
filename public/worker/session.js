// Built worker plugin: session
// Generated on: 2025-05-20T04:27:04.515Z

// src/worker/plugins/session.ts
var sessionWorker = {
  id: "session",
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
        return { error: `Method ${method} not supported for session` };
    }
  }
};
var session_default = sessionWorker;
export {
  session_default as default
};
