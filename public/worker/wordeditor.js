// Built worker plugin: wordeditor
// Generated on: 2025-05-20T17:42:12.655Z

// src/worker/plugins/wordeditor.ts
var documentText = "";
var wordeditorWorker = {
  id: "wordeditor",
  setText(text) {
    documentText = typeof text === "string" ? text : "";
    return { success: true };
  },
  getText() {
    return { success: true, text: documentText };
  },
  /**
   * Generic handler function that processes method calls with parameters
   */
  handle(method, params) {
    switch (method) {
      case "setText": {
        if (!params || typeof params.text !== "string") {
          return { error: "setText requires a 'text' parameter of type string" };
        }
        return this.setText(params.text);
      }
      case "getText": {
        return this.getText();
      }
      default:
        return { error: `Method ${method} not supported for wordeditor` };
    }
  }
};
var wordeditor_default = wordeditorWorker;
export {
  wordeditor_default as default
};
