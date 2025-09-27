// Clean API Client Provider for React Context Pattern
import React, { useMemo } from 'react';
import { ApiClientProvider as SharedApiClientProvider } from '@shared/api-client';
import type { IApiClient, IApiComponent, IActionResult } from '@shared/api-client';
import { useApi } from './ApiProvider';

/**
 * Direct API Client implementation for React Context Pattern
 *
 * This client connects directly to the host's API provider without going through
 * the bridge pattern, providing cleaner integration for React remotes.
 */
class DirectApiClient implements IApiClient {
  private registeredComponents = new Set<string>();
  constructor(
    private executeActionFn: (
      componentId: string,
      actionId: string,
      parameters?: Record<string, unknown>
    ) => Promise<IActionResult>,
    private registerComponentFn: (component: IApiComponent) => void,
    private unregisterComponentFn: (id: string) => void,
    private getComponentsFn: () => IApiComponent[],
    private remoteId: string = 'unknown-remote'
  ) {}

  async executeAction(
    componentId: string,
    actionId: string,
    parameters?: Record<string, unknown>
  ): Promise<IActionResult> {
    console.log(`[Direct API Client] Executing ${componentId}.${actionId} via React Context`);
    return await this.executeActionFn(componentId, actionId, parameters);
  }

  async registerComponent(component: IApiComponent): Promise<void> {
    const fullId = `${this.remoteId}.${component.id}`;

    // Prevent duplicate registrations
    if (this.registeredComponents.has(fullId)) {
      console.log(`[Direct API Client] Component ${fullId} already registered, skipping`);
      return;
    }

    console.log(`[Direct API Client] Registering component ${component.id} from remote ${this.remoteId} via React Context`);

    // Add remote prefix to avoid conflicts
    const remoteComponent = {
      ...component,
      id: fullId,
    };

    this.registerComponentFn(remoteComponent);
    this.registeredComponents.add(fullId);
  }

  async unregisterComponent(componentId: string): Promise<void> {
    const fullId = `${this.remoteId}.${componentId}`;
    this.registeredComponents.delete(fullId);
    try {
      this.unregisterComponentFn(fullId);
    } catch (err) {
      console.warn(
        `[Direct API Client] Failed to unregister component ${fullId}:`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  async getComponents(): Promise<IApiComponent[]> {
    return this.getComponentsFn();
  }

  async subscribeEvent(
    eventName: string,
    callback: (data: unknown) => void
  ): Promise<() => void> {
    // Use the global event bus for consistency
    const eventBus = (window as any).eventBus;
    if (eventBus) {
      return eventBus.subscribe(eventName, callback);
    }

    console.warn(`[Direct API Client] Event bus not available for subscribing to ${eventName}`);
    return () => {};
  }

  async emitEvent(eventName: string, data?: unknown): Promise<void> {
    const eventBus = (window as any).eventBus;
    if (eventBus) {
      eventBus.emit(eventName, data);
    } else {
      console.warn(`[Direct API Client] Event bus not available for emitting ${eventName}`);
    }
  }

  async getEventNames(): Promise<string[]> {
    console.warn('[Direct API Client] getEventNames not yet implemented');
    return [];
  }

  async sendMCPMessage(message: any): Promise<any> {
    console.warn('[Direct API Client] MCP message support not yet implemented for React Context pattern');
    return { jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id: message.id };
  }

  async listMCPTools(): Promise<any[]> {
    console.warn('[Direct API Client] MCP tools listing not yet implemented for React Context pattern');
    return [];
  }

  async callMCPTool(toolName: string, arguments_: Record<string, unknown> = {}): Promise<any> {
    console.warn(`[Direct API Client] MCP tool call not yet implemented for React Context pattern: ${toolName}`);
    throw new Error(`MCP tool call not available in React Context pattern: ${toolName}`);
  }
}

/**
 * Clean API Client Provider for React Context Pattern
 *
 * This provider creates a direct connection to the host's API system
 * without going through the bridge pattern, offering cleaner integration
 * for React remotes.
 *
 * @example
 * ```tsx
 * // Host wraps remote with Context
 * <ApiClientProvider remoteId="notepad">
 *   <NotepadRemote />
 * </ApiClientProvider>
 *
 * // Remote uses normal React Context
 * const MyComponent = () => {
 *   const apiClient = useApiClient(); // Clean React Context!
 *   return <div>API available via React Context</div>;
 * };
 * ```
 */
export const ApiClientProvider: React.FC<{
  children: React.ReactNode;
  remoteId?: string;
}> = ({ children, remoteId = 'unknown-remote' }) => {
  const hostApi = useApi();
  
  // Extract stable references to prevent recreation
  const { executeAction, registerComponent, unregisterComponent, getComponents } = hostApi;

  // Use a ref to store the client and only recreate when remoteId changes
  const apiClientRef = React.useRef<DirectApiClient | null>(null);
  const currentRemoteIdRef = React.useRef<string>('');

  const apiClient = useMemo(() => {
    // Only recreate if remoteId changed or client doesn't exist
    if (!apiClientRef.current || currentRemoteIdRef.current !== remoteId) {
      console.log(`[ApiClientProvider] Creating direct API client for remote: ${remoteId}`);
      currentRemoteIdRef.current = remoteId;

      // Adapt host API types to shared API client interface
      const executeActionAdapted = (
        componentId: string,
        actionId: string,
        parameters?: Record<string, unknown>
      ) => executeAction(componentId, actionId, parameters);

      const registerComponentAdapted = (component: IApiComponent) => {
        // Shapes are compatible enough; pass through directly
        (registerComponent as any)(component);
      };

      const unregisterComponentAdapted = (id: string) => {
        (unregisterComponent as any)(id);
      };

      const getComponentsAdapted = () => (getComponents as any)();

      apiClientRef.current = new DirectApiClient(
        executeActionAdapted,
        registerComponentAdapted,
        unregisterComponentAdapted,
        getComponentsAdapted,
        remoteId
      );
    }

    return apiClientRef.current;
  }, [remoteId]); // Only depend on remoteId, not the host API functions

  return (
    <SharedApiClientProvider apiClient={apiClient}>
      {children}
    </SharedApiClientProvider>
  );
};

/**
 * Re-export the original ApiProvider for compatibility
 */
export { ApiProvider } from './ApiProvider';
