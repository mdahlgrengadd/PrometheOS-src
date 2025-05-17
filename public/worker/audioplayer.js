// Built worker plugin: audioplayer
// Generated on: 2025-05-17T09:58:28.384Z

// src/worker/plugins/audioplayer.ts
var audioplayerWorker = {
  id: "audioplayer",
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
        return { error: `Method ${method} not supported for audioplayer` };
    }
  }
};
var audioplayer_default = audioplayerWorker;
export {
  audioplayer_default as default
};
