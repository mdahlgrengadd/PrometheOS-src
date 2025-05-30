/**
 * MCP (Model Context Protocol) Server Worker
 * Converts Desktop API components to MCP tools for WebLLM function calling
 */

import { WorkerPlugin } from '../../plugins/types';

// MCP Protocol Types
export interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolResult {
  content: Array<{
    type: "text" | "image" | "resource";
    text?: string;
    data?: string;
    resource?: string;
  }>;
  isError?: boolean;
}

// JSON-RPC 2.0 Types
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

// Internal tool registry
interface ToolDefinition {
  componentId: string;
  action: string;
  tool: MCPTool;
}

/**
 * MCP Server Worker Implementation
 */
const MCPServerWorker: WorkerPlugin = {
  id: "mcp-server",

  // Private state
  _tools: new Map<string, ToolDefinition>(),
  _isInitialized: false,
  // Track registered components to prevent duplicates
  _registeredComponents: new Set<string>(),

  /**
   * Initialize the MCP server
   */
  async initialize(): Promise<{ status: string; message?: string }> {
    try {
      this._isInitialized = true;
      console.log("MCP Server initialized");
      return { status: "success", message: "MCP Server initialized" };
    } catch (error) {
      return {
        status: "error",
        message: `Failed to initialize MCP Server: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  },

  /**
   * Process a direct MCP protocol JSON-RPC message
   */
  async processMCPMessage(message: MCPRequest): Promise<MCPResponse> {
    try {
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

      // Process based on method
      switch (message.method) {
        case "tools/list":
          return this._handleToolsList(message);

        case "tools/call":
          return this._handleToolsCall(message);

        // Add other MCP methods as needed
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
  },

  /**
   * Handle tools/list MCP method
   */
  async _handleToolsList(message: MCPRequest): Promise<MCPResponse> {
    // Allow provider format override via params ("openai" or "anthropic")
    const format = (message.params && typeof message.params === 'object' && typeof message.params['format'] === 'string')
      ? (message.params['format'] as 'openai' | 'anthropic')
      : 'openai';
    const tools = await this.getAvailableTools(format);

    return {
      jsonrpc: "2.0",
      result: tools,
      id: message.id || null,
    };
  },

  /**
   * Handle tools/call MCP method
   */
  async _handleToolsCall(message: MCPRequest): Promise<MCPResponse> {
    const params = message.params;
    if (!params || typeof params !== "object") {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Invalid params",
        },
        id: message.id || null,
      };
    }

    const { name, arguments: args } = params as {
      name?: string;
      arguments?: Record<string, unknown>;
    };

    if (!name || typeof name !== "string") {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Missing tool name",
        },
        id: message.id || null,
      };
    }

    // Execute the tool
    try {
      const result = await this.executeTool({
        name,
        arguments: args || {},
      });

      return {
        jsonrpc: "2.0",
        result,
        id: message.id || null,
      };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: `Error executing tool: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
        id: message.id || null,
      };
    }
  },

  /**
   * Register a tool from an API component
   */
  async registerTool(
    componentId: string,
    action: string,
    description: string,
    parameters?: Record<
      string,
      { type: string; description?: string; required?: boolean }
    >
  ): Promise<{ status: string; message?: string }> {
    try {
      const toolName = `${componentId}.${action}`;

      // Check for duplicate registration
      if ((this._tools as Map<string, ToolDefinition>).has(toolName)) {
        return {
          status: "error",
          message: `Tool ${toolName} is already registered`,
        };
      }

      // Build input schema from parameters
      const inputSchema = {
        type: "object" as const,
        properties: parameters || {},
        required: parameters
          ? Object.keys(parameters).filter((key) => parameters[key].required)
          : [],
      };

      const tool: MCPTool = {
        name: toolName,
        description,
        parameters: inputSchema,
      };

      const toolDef: ToolDefinition = {
        componentId,
        action,
        tool,
      };

      this._tools.set(toolName, toolDef);
      this._registeredComponents.add(componentId); // Track registered component

      console.log(`Registered MCP tool: ${toolName}`);
      return { status: "success", message: `Tool ${toolName} registered` };
    } catch (error) {
      return {
        status: "error",
        message: `Failed to register tool: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  },

  /**
   * Unregister a tool
   */
  async unregisterTool(
    toolName: string
  ): Promise<{ status: string; message?: string }> {
    if (!this._tools.has(toolName)) {
      return { status: "error", message: `Tool ${toolName} not found` };
    }

    this._tools.delete(toolName);

    // Check if component is still registered with other tools
    const componentId = toolName.split('.')[0];
    let isComponentRegistered = false;
    for (const registeredTool of this._tools.keys()) {
      if (registeredTool.startsWith(componentId + '.')) {
        isComponentRegistered = true;
        break;
      }
    }

    if (!isComponentRegistered) {
      this._registeredComponents.delete(componentId); // Cleanup untracked component
    }

    console.log(`Unregistered MCP tool: ${toolName}`);
    return { status: "success", message: `Tool ${toolName} unregistered` };
  },

  /**
   * Get all available tools
   */
  /**
   * Get all available tools, with optional format for OpenAI or Anthropic
   * @param format 'openai' | 'anthropic' (default: 'openai')
   */
  async getAvailableTools(format: 'openai' | 'anthropic' = 'openai'): Promise<MCPTool[]> {
    // Both OpenAI and Anthropic expect an array of tool objects with 'parameters' field
    // This method is future-proofed for further provider-specific tweaks
    return Array.from((this._tools as Map<string, ToolDefinition>).values()).map((toolDef) => toolDef.tool);
  },

  /**
   * Execute a tool call
   */
  async executeTool(toolCall: MCPToolCall): Promise<MCPToolResult> {
    const toolDef = (this._tools as Map<string, ToolDefinition>).get(toolCall.name);

    if (!toolDef) {
      return {
        content: [{ type: "text", text: `Tool ${toolCall.name} not found` }],
        isError: true,
      };
    }

    try {
      // Send execution request to main thread via postMessage
      // This will be handled by the DesktopApiBridge
      const result = await this._executeToolInMainThread(
        toolDef.componentId,
        toolDef.action,
        toolCall.arguments
      );

      // Format result for MCP
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: false,
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing ${toolCall.name}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  },

  /**
   * Execute tool in main thread via postMessage
   */
  async _executeToolInMainThread(
    componentId: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const requestId = `mcp-tool-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      // Listen for response
      const messageHandler = (event: MessageEvent) => {
        if (
          event.data.type === "mcp-tool-response" &&
          event.data.requestId === requestId
        ) {
          console.log(`MCP tool response received for ${requestId}: ${componentId}.${action}`);
          self.removeEventListener("message", messageHandler);
          
          // Clear the timeout since we got a response
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
          }

          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };

      self.addEventListener("message", messageHandler);

      // Send request to main thread
      console.log(`MCP tool request sent: ${requestId} for ${componentId}.${action}`);
      self.postMessage({
        type: "mcp-tool-request",
        requestId,
        componentId,
        action,
        params,
      });

      // Timeout after 30 seconds
      timeoutId = setTimeout(() => {
        console.log(`MCP tool timeout: ${requestId} for ${componentId}.${action}`);
        self.removeEventListener("message", messageHandler);
        reject(new Error("Tool execution timeout"));
      }, 30000);
    });
  },

  /**
   * Auto-register tools from API components list with duplicate prevention
   */
  async autoRegisterFromApiComponents(
    components: Array<{
      id: string;
      actions: Array<{
        name: string;
        description: string;
        parameters?: Record<
          string,
          { type: string; description?: string; required?: boolean }
        >;
      }>;
    }>
  ): Promise<{ status: string; registered: number; errors: string[] }> {
    let registered = 0;
    const errors: string[] = [];

    for (const component of components) {
      // Skip if component is already registered to prevent duplicates
      if (this._registeredComponents.has(component.id)) {
        console.log(`MCP: Skipping already registered component: ${component.id}`);
        continue;
      }

      // Mark component as registered
      this._registeredComponents.add(component.id);

      for (const action of component.actions) {
        try {
          const result = await this.registerTool(
            component.id,
            action.name,
            action.description,
            action.parameters
          );

          if (result.status === "success") {
            registered++;
          } else {
            errors.push(`${component.id}.${action.name}: ${result.message}`);
          }
        } catch (error) {
          errors.push(
            `${component.id}.${action.name}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    }

    return {
      status: "success",
      registered,
      errors,
    };
  },

  /**
   * Unregister all tools for a specific component
   */
  async unregisterComponent(
    componentId: string
  ): Promise<{ status: string; unregistered: number; errors: string[] }> {
    let unregistered = 0;
    const errors: string[] = [];

    // Find all tools for this component
    const toolsToRemove: string[] = [];
    for (const [toolName, toolDef] of this._tools.entries()) {
      if (toolDef.componentId === componentId) {
        toolsToRemove.push(toolName);
      }
    }

    // Unregister each tool
    for (const toolName of toolsToRemove) {
      try {
        const result = await this.unregisterTool(toolName);
        if (result.status === "success") {
          unregistered++;
        } else {
          errors.push(`${toolName}: ${result.message}`);
        }
      } catch (error) {
        errors.push(
          `${toolName}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    // Remove component from registered set
    this._registeredComponents.delete(componentId);
    console.log(`MCP: Unregistered component ${componentId} with ${unregistered} tools`);

    return {
      status: "success",
      unregistered,
      errors,
    };
  },

  /**
   * Get tool by name
   */
  async getTool(toolName: string): Promise<MCPTool | null> {
    const toolDef = (this._tools as Map<string, ToolDefinition>).get(toolName);
    return toolDef ? toolDef.tool : null;
  },

  /**
   * Check if server is initialized
   */
  isInitialized(): boolean {
    return this._isInitialized;
  },

  /**
   * Get server stats
   */
  getStats(): { toolCount: number; isInitialized: boolean } {
    return {
      toolCount: this._tools.size,
      isInitialized: this._isInitialized,
    };
  },

  /**
   * Clean up resources
   */
  cleanup(): void {
    this._tools.clear();
    this._registeredComponents.clear();
    this._isInitialized = false;
    console.log("MCP Server cleaned up");
  },

  /**
   * Generic handler function that processes method calls with parameters
   */
  handle(method: string, params?: Record<string, unknown>): unknown {
    switch (method) {
      case "initialize":
        return this.initialize();

      case "registerTool":
        if (!params?.componentId || !params?.action || !params?.description) {
          return {
            status: "error",
            message:
              "registerTool requires componentId, action, and description",
          };
        }
        return this.registerTool(
          params.componentId as string,
          params.action as string,
          params.description as string,
          params.parameters as Record<string, any> | undefined
        );

      case "unregisterTool":
        if (!params?.toolName) {
          return {
            status: "error",
            message: "unregisterTool requires toolName",
          };
        }
        return this.unregisterTool(params.toolName as string);

      case "getAvailableTools":
        // Allow provider format override via params ("openai" or "anthropic")
        return this.getAvailableTools(params && typeof params.format === 'string' ? params.format as 'openai' | 'anthropic' : 'openai');

      case "executeTool":
        if (!params?.toolCall) {
          return {
            content: [
              { type: "text", text: "executeTool requires toolCall parameter" },
            ],
            isError: true,
          };
        }
        return this.executeTool(params.toolCall as MCPToolCall);

      case "autoRegisterFromApiComponents":
        if (!params?.components) {
          return {
            status: "error",
            message: "autoRegisterFromApiComponents requires components array",
          };
        }
        return this.autoRegisterFromApiComponents(params.components as any[]);

      case "unregisterComponent":
        if (!params?.componentId) {
          return {
            status: "error",
            message: "unregisterComponent requires componentId",
          };
        }
        return this.unregisterComponent(params.componentId as string);

      case "getTool":
        if (!params?.toolName) {
          return null;
        }
        return this.getTool(params.toolName as string);

      case "isInitialized":
        return this.isInitialized();

      case "getStats":
        return this.getStats();

      case "cleanup":
        return this.cleanup();

      case "processMCPMessage":
        if (!params?.message) {
          return {
            jsonrpc: "2.0",
            error: {
              code: -32602,
              message: "Missing message parameter",
            },
            id: null,
          };
        }
        return this.processMCPMessage(params.message as MCPRequest);

      default:
        return { status: "error", message: `Unknown method: ${method}` };
    }
  },
};

// Export the MCP server plugin instance as default
export default MCPServerWorker;
