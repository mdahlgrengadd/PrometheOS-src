/**
 * Comlink communication handler for Pyodide plugin
 */

import * as Comlink from "comlink";

import type { DesktopApiBridge } from "../../../api/bridges/HybridDesktopApiBridge";

export class ComlinkHandler {
  /**
   * Handle Comlink port message from main thread
   */
  handleComlinkPort(port: MessagePort): void {
    try {
      console.log("Received Comlink port from main thread");

      // Wrap the port via Comlink and expose both API and MCP handlers
      console.log(
        "Wrapping Comlink port for desktop_api_comlink and desktop_mcp_comlink"
      );
      const remote = Comlink.wrap<{
        api: DesktopApiBridge;
        mcp: { processMessage(message: unknown): Promise<unknown> };
      }>(port);

      // Assign proxies to globals for Python context
      (globalThis as Record<string, unknown>).desktop_api_comlink = remote.api;
      (globalThis as Record<string, unknown>).desktop_mcp_comlink = remote.mcp;
      console.log(
        "desktop_api_comlink and desktop_mcp_comlink proxies set on globalThis"
      );

      // Start the port for Comlink
      port.start();
      console.log("Comlink bridge proxies exposed to Python context");
    } catch (error) {
      console.error("Error handling Comlink port:", error);
    }
  }
}
