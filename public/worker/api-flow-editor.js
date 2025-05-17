// Built worker plugin: api-flow-editor
// Generated on: 2025-05-17T14:57:48.527Z

// src/worker/plugins/api-flow-editor.ts
var apiFlowEditorWorker = {
  id: "api-flow-editor",
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
        return { error: `Method ${method} not supported for api-flow-editor` };
    }
  }
};
var api_flow_editor_default = apiFlowEditorWorker;
export {
  api_flow_editor_default as default
};
