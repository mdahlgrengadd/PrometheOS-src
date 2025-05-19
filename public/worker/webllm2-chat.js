// Built worker plugin: webllm2-chat
// Generated on: 2025-05-19T17:17:08.044Z

// src/worker/plugins/webllm2-chat.ts
var webllm2ChatWorker = {
  id: "webllm2-chat",
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
        return { error: `Method ${method} not supported for webllm2-chat` };
    }
  }
};
var webllm2_chat_default = webllm2ChatWorker;
export {
  webllm2_chat_default as default
};
