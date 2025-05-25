import { WorkerPlugin } from '../../plugins/types';

/**
 * Worker logic for Wordeditor
 * This runs in a Web Worker context with no DOM access
 */

// Internal state for the document text (since worker has no DOM, just store as string)
let documentText = "";

const wordeditorWorker: WorkerPlugin = {
  id: "wordeditor",

  setText(text: string) {
    documentText = typeof text === "string" ? text : "";
    return { success: true };
  },

  getText() {
    return { success: true, text: documentText };
  },

  /**
   * Generic handler function that processes method calls with parameters
   */
  handle(method: string, params?: Record<string, unknown>): unknown {
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
  },
};

// Export the worker instance as default
export default wordeditorWorker;
