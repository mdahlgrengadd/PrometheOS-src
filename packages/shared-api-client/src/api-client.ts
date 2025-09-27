// Federated API Client - Preserves sophisticated integration architecture
import {
  IApiClient,
  IApiComponent,
  IActionResult,
  IHostApiBridge,
  MCPRequest,
  MCPResponse,
} from './types';
import { validateParameters } from './validation';

declare global {
  interface Window {
    __HOST_API_BRIDGE__?: IHostApiBridge;
    __REMOTE_ID__?: string;
  }
}

export class FederatedApiClient implements IApiClient {
  private hostBridge: IHostApiBridge;
  private remoteId: string;
  private eventSubscriptions = new Map<string, Set<(data: unknown) => void>>();

  constructor() {
    // Connect to host's exposed API bridge
    this.hostBridge = window.__HOST_API_BRIDGE__;
    this.remoteId = window.__REMOTE_ID__ || 'unknown-remote';

    if (!this.hostBridge) {
      throw new Error(
        'Host API Bridge not available. Make sure this remote is loaded by the host application.'
      );
    }
  }

  async executeAction(
    componentId: string,
    actionId: string,
    parameters?: Record<string, unknown>
  ): Promise<IActionResult> {
    try {
      // Validate parameters for security (prevents injection attacks)
      const validatedParams = await validateParameters(
        componentId,
        actionId,
        parameters
      );

      // Execute via host bridge
      const result = await this.hostBridge.executeAction(
        componentId,
        actionId,
        validatedParams
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: `API execution failed: ${errorMessage}`,
      };
    }
  }

  async registerComponent(component: IApiComponent): Promise<void> {
    try {
      // Register component with host bridge
      await this.hostBridge.registerRemoteComponent(this.remoteId, component);

      console.log(
        `[API Client] Registered component ${component.id} from remote ${this.remoteId}`
      );
    } catch (error) {
      console.error(
        `[API Client] Failed to register component ${component.id}:`,
        error
      );
      throw error;
    }
  }

  async unregisterComponent(componentId: string): Promise<void> {
    // Note: Implementation depends on host bridge extension
    console.warn(`[API Client] Component unregistration not yet implemented for ${componentId}`);
  }

  async getComponents(): Promise<IApiComponent[]> {
    // Note: This would require host bridge extension to list components
    console.warn('[API Client] getComponents not yet implemented');
    return [];
  }

  async subscribeEvent(
    eventName: string,
    callback: (data: unknown) => void
  ): Promise<() => void> {
    // Add to local subscription tracking
    if (!this.eventSubscriptions.has(eventName)) {
      this.eventSubscriptions.set(eventName, new Set());
    }
    this.eventSubscriptions.get(eventName)!.add(callback);

    // Subscribe via host bridge
    const unsubscribe = await this.hostBridge.subscribeEvent(
      eventName,
      callback
    );

    // Return cleanup function
    return () => {
      const callbacks = this.eventSubscriptions.get(eventName);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.eventSubscriptions.delete(eventName);
        }
      }
      unsubscribe();
    };
  }

  async emitEvent(eventName: string, data?: unknown): Promise<void> {
    await this.hostBridge.emitEvent(eventName, data);
  }

  async getEventNames(): Promise<string[]> {
    // Note: This would require host bridge extension
    console.warn('[API Client] getEventNames not yet implemented');
    return [];
  }

  async sendMCPMessage(message: MCPRequest): Promise<MCPResponse> {
    try {
      // Ensure proper JSON-RPC 2.0 format
      const mcpMessage: MCPRequest = {
        jsonrpc: '2.0',
        ...message,
        id: message.id || `remote-${this.remoteId}-${Date.now()}`,
      };

      // Send via API bridge execution (will be routed to MCP server)
      const result = await this.executeAction('mcp', 'processMessage', {
        message: mcpMessage,
      });

      if (result.success) {
        return result.data as MCPResponse;
      } else {
        return {
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: result.error || 'Internal error',
          },
          id: mcpMessage.id || null,
        };
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: `MCP message failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
        id: message.id || null,
      };
    }
  }

  // Convenience methods for common MCP operations
  async listMCPTools(): Promise<any[]> {
    const response = await this.sendMCPMessage({
      jsonrpc: '2.0',
      method: 'tools/list',
      id: `tools-list-${Date.now()}`,
    });

    return response.result as any[] || [];
  }

  async callMCPTool(
    toolName: string,
    arguments_: Record<string, unknown> = {}
  ): Promise<any> {
    const response = await this.sendMCPMessage({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: arguments_,
      },
      id: `tool-call-${Date.now()}`,
    });

    if (response.error) {
      throw new Error(`MCP tool call failed: ${response.error.message}`);
    }

    return response.result;
  }
}

// Singleton instance for use across the remote
let apiClientInstance: FederatedApiClient | null = null;

export function getApiClient(): FederatedApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new FederatedApiClient();
  }
  return apiClientInstance;
}