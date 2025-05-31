/**
 * MCP Protocol message handler for Pyodide plugin
 */

import type { PythonResult } from "./types";

export class MCPHandler {
  private forwardToMCPServer: (
    message: Record<string, unknown>
  ) => Promise<unknown>;

  constructor(
    forwardToMCPServer: (message: Record<string, unknown>) => Promise<unknown>
  ) {
    this.forwardToMCPServer = forwardToMCPServer;
  }

  /**
   * Handle MCP Protocol JSON-RPC 2.0 messages
   */
  async handleMCPProtocolMessage(
    messageOrJson: Record<string, unknown> | string
  ): Promise<PythonResult> {
    try {
      // Handle both JSON string (from Python) and object (direct calls)
      let message: Record<string, unknown>;
      if (typeof messageOrJson === "string") {
        console.log("Parsing JSON message:", messageOrJson);
        message = JSON.parse(messageOrJson);
      } else {
        message = messageOrJson;
      }

      console.log("Handling MCP protocol message:", JSON.stringify(message));
      console.log("Message type:", typeof message);
      console.log("Message keys:", Object.keys(message || {}));

      // Forward the message to the MCP server plugin
      const response = await this.forwardToMCPServer(message);

      return {
        success: true,
        result: response,
      };
    } catch (error) {
      console.error("Error handling MCP message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
