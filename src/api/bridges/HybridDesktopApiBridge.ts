/**
 * Hybrid Desktop API Bridge - Connects Pyodide Python to Desktop API System
 * Supports both Comlink (ergonomic) and postMessage (MCP protocol) interfaces
 */

import * as Comlink from 'comlink';

import { eventBus } from '../../plugins/EventBus';
import { IApiComponent, IApiContextValue } from '../core/types';

export interface DesktopApiBridge {
  // Core API methods (all promise-based to support Comlink remote)
  listComponents(): Promise<string[]>;
  execute(
    componentId: string,
    action: string,
    params?: Record<string, unknown>
  ): Promise<unknown>;
  subscribeEvent(
    eventName: string,
    callback: (data: unknown) => void
  ): Promise<() => void>;
  emitEvent(eventName: string, data?: unknown): Promise<void>;
}

/**
 * Creates a bridge object that can be injected into Pyodide worker
 * This provides Python access to the Desktop API system
 */
export function createDesktopApiBridge(): DesktopApiBridge {
  return {
    /**
     * List all available API components
     */
    async listComponents(): Promise<string[]> {
      try {
        // Access the global API context if available
        const apiContext = (globalThis as Record<string, unknown>)
          .desktop_api_context as IApiContextValue | undefined;
        if (apiContext && apiContext.getComponents) {
          const components = apiContext.getComponents();
          return components.map((c) => c.id);
        }
        return [];
      } catch (error) {
        console.error("Error listing API components:", error);
        return [];
      }
    },

    /**
     * Execute an action on a component
     */
    async execute(
      componentId: string,
      action: string,
      params?: Record<string, unknown>
    ): Promise<unknown> {
      try {
        // Access the global API context if available
        const apiContext = (globalThis as Record<string, unknown>)
          .desktop_api_context as IApiContextValue | undefined;
        if (apiContext && apiContext.executeAction) {
          // Normalize parameters: convert Map to plain object if needed
          let actionParams: Record<string, unknown> | undefined = params;
          if (params instanceof Map) {
            actionParams = Object.fromEntries(params as Map<string, unknown>);
          }
          const result = await apiContext.executeAction(
            componentId,
            action,
            actionParams
          );
          return result;
        }
        throw new Error("API context not available");
      } catch (error) {
        console.error(`Error executing ${componentId}.${action}:`, error);
        throw error;
      }
    },

    /**
     * Subscribe to EventBus events
     */
    async subscribeEvent(
      eventName: string,
      callback: (data: unknown) => void
    ): Promise<() => void> {
      const unsubscribe = eventBus.subscribe(eventName, callback);
      return unsubscribe;
    },

    /**
     * Emit an event to the EventBus
     */
    async emitEvent(eventName: string, data?: unknown): Promise<void> {
      eventBus.emit(eventName, data);
    },
  };
}

// Types for MCP protocol messages
export interface MCPRequest {
  jsonrpc: string;
  method: string;
  params?: Record<string, unknown>;
  id?: string | number;
}

export interface MCPResponse {
  jsonrpc: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
  id: string | number | null;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * MCP protocol JSON-RPC 2.0 handler
 * Handles standardized MCP message format for AI agent compatibility
 */
export class MCPProtocolHandler {
  private apiContext: IApiContextValue | undefined;

  constructor() {
    this.apiContext = (globalThis as Record<string, unknown>)
      .desktop_api_context as IApiContextValue | undefined;
  }

  /**
   * Process an MCP protocol message
   * @param message JSON-RPC 2.0 message
   * @returns JSON-RPC 2.0 response
   */
  async processMessage(message: MCPRequest): Promise<MCPResponse> {
    // Validate JSON-RPC 2.0 message format
    if (!message.jsonrpc || message.jsonrpc !== "2.0" || !message.method) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32600,
          message: "Invalid Request",
        },
        id: message.id || null,
      };
    }

    // Process by method
    try {
      switch (message.method) {
        case "tools/list":
          return this.handleToolsList(message);

        case "tools/call":
          return this.handleToolsCall(message);

        case "resources/list":
          return this.handleResourcesList(message);

        case "resources/read":
          return this.handleResourcesRead(message);

        default:
          return {
            jsonrpc: "2.0",
            error: {
              code: -32601,
              message: `Method ${message.method} not found`,
            },
            id: message.id || null,
          };
      }
    } catch (error) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: `Internal error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
        id: message.id || null,
      };
    }
  }

  /**
   * Handle tools/list method
   */
  private async handleToolsList(message: MCPRequest): Promise<MCPResponse> {
    // Get all components and convert to MCP tool format
    if (!this.apiContext || !this.apiContext.getComponents) {
      throw new Error("API context not available");
    }

    const componentsResult = this.apiContext.getComponents();

    // Ensure components is an array
    const components = Array.isArray(componentsResult)
      ? componentsResult
      : Object.values(componentsResult || {});

    if (!components || components.length === 0) {
      // Return empty tools array if no components found
      return {
        jsonrpc: "2.0",
        result: [],
        id: message.id || null,
      };
    }

    // Now safely use reduce on the array
    const tools = components.reduce(
      (all: MCPToolDefinition[], component: IApiComponent) =>
        all.concat(
          component.actions.map((action) => ({
            name: `${component.id}.${action.id}`,
            description: action.description,
            parameters: {
              type: "object",
              properties: (action.parameters || []).reduce(
                (acc: Record<string, unknown>, param) => {
                  acc[param.name] = {
                    type: param.type,
                    description: param.description,
                  };
                  return acc;
                },
                {}
              ),
              required: (action.parameters || [])
                .filter((param) => param.required)
                .map((param) => param.name),
            },
          }))
        ),
      [] as MCPToolDefinition[]
    );

    return {
      jsonrpc: "2.0",
      result: tools,
      id: message.id || null,
    };
  }

  /**
   * Handle tools/call method
   */
  private async handleToolsCall(message: MCPRequest): Promise<MCPResponse> {
    const { name, arguments: args } =
      message.params ||
      ({} as {
        name?: string;
        arguments?: Record<string, unknown>;
      });

    if (!name || typeof name !== "string") {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Invalid params: missing tool name",
        },
        id: message.id || null,
      };
    }

    // Parse component.action format
    const [componentId, actionId] = name.split(".");
    if (!componentId || !actionId) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Invalid tool name format. Expected: component.action",
        },
        id: message.id || null,
      };
    }

    // Execute the action
    try {
      if (!this.apiContext || !this.apiContext.executeAction) {
        throw new Error("API context not available");
      }

      // Create a properly typed parameter object with type guard
      let actionParams: Record<string, unknown> = {};
      if (args && typeof args === "object" && args !== null) {
        actionParams = args as Record<string, unknown>;
      }

      const result = await this.apiContext.executeAction(
        componentId,
        actionId,
        actionParams
      );

      return {
        jsonrpc: "2.0",
        result: result,
        id: message.id || null,
      };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: `Error executing ${name}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
        id: message.id || null,
      };
    }
  }

  /**
   * Handle resources/list method
   */
  private async handleResourcesList(message: MCPRequest): Promise<MCPResponse> {
    // Implementation to be expanded in future sprints
    return {
      jsonrpc: "2.0",
      result: [],
      id: message.id || null,
    };
  }

  /**
   * Handle resources/read method
   */
  private async handleResourcesRead(message: MCPRequest): Promise<MCPResponse> {
    // Implementation to be expanded in future sprints
    return {
      jsonrpc: "2.0",
      error: {
        code: -32601,
        message: "Method resources/read not implemented yet",
      },
      id: message.id || null,
    };
  }
}

/**
 * Setup the global bridge for Pyodide workers
 * This should be called during app initialization
 */
export function setupGlobalHybridApiBridge(): void {
  const bridge = createDesktopApiBridge();
  const mcpHandler = new MCPProtocolHandler();

  // Make the regular bridge available globally for worker access
  (globalThis as Record<string, unknown>).desktop_api_bridge = bridge;

  // Make the MCP handler available globally
  (globalThis as Record<string, unknown>).desktop_mcp_handler = mcpHandler;

  // Expose the bridge via Comlink for direct access
  const comlinkBridge = Comlink.proxy(bridge);
  (globalThis as Record<string, unknown>).desktop_api_comlink = comlinkBridge;

  // Expose the MCP protocol handler via Comlink for direct JSON-RPC calls
  const comlinkMcp = Comlink.proxy(mcpHandler);
  (globalThis as Record<string, unknown>).desktop_mcp_comlink = comlinkMcp;

  console.log("Hybrid Desktop API Bridge initialized (Comlink + MCP)");
}

/**
 * Store the API context globally so both bridges can access it
 * This should be called when the API context is available
 */
export function setGlobalApiContext(apiContext: IApiContextValue): void {
  (globalThis as Record<string, unknown>).desktop_api_context = apiContext;
}
