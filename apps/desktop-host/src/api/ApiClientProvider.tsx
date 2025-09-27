// Clean API Client Provider for React Context Pattern
import React, { useMemo } from 'react';
import { ApiClientProvider as SharedApiClientProvider } from '../../../../packages/shared-api-client/src/hooks';
import { IApiClient, IApiComponent, IActionResult } from '../../../../packages/shared-api-client/src/types';
import { useApi } from './ApiProvider';

/**
 * Direct API Client implementation for React Context Pattern
 *
 * This client connects directly to the host's API provider without going through
 * the bridge pattern, providing cleaner integration for React remotes.
 */
class DirectApiClient implements IApiClient {
  constructor(
    private executeActionFn: (componentId: string, actionId: string, parameters?: Record<string, unknown>) => Promise<IActionResult>,
    private registerComponentFn: (component: IApiComponent) => void,
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
    console.log(`[Direct API Client] Registering component ${component.id} from remote ${this.remoteId} via React Context`);

    // Add remote prefix to avoid conflicts
    const remoteComponent = {
      ...component,
      id: `${this.remoteId}.${component.id}`,
    };

    this.registerComponentFn(remoteComponent);
  }

  async unregisterComponent(componentId: string): Promise<void> {
    console.warn(`[Direct API Client] Component unregistration not yet implemented for ${componentId}`);
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
  const { executeAction, registerComponent, getComponents } = useApi();

  const apiClient = useMemo(() => {
    console.log(`[ApiClientProvider] Creating direct API client for remote: ${remoteId}`);

    return new DirectApiClient(
      executeAction,
      registerComponent,
      getComponents,
      remoteId
    );
  }, [executeAction, registerComponent, getComponents, remoteId]);

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