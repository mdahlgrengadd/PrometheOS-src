import React, { useMemo } from 'react';

import { useApi } from './ApiProvider';
import { eventBus } from '../plugins/EventBus';

// Reuse the shared API client context so remotes using useApiClient() can pick it up
import { ApiClientProvider } from '../../../packages/shared-api-client/src/hooks';
import type {
  IApiClient,
  IApiComponent as SharedApiComponent,
  IActionResult,
} from '../../../packages/shared-api-client/src/types';

// Host-side provider that adapts the host ApiProvider to the shared IApiClient interface
export const HostApiClientProvider: React.FC<{
  children: React.ReactNode;
  remoteId?: string;
}> = ({ children }) => {
  const api = useApi();

  const client = useMemo<IApiClient>(() => {
    const executeAction = async (
      componentId: string,
      actionId: string,
      parameters?: Record<string, unknown>
    ): Promise<IActionResult> => {
      return api.executeAction(componentId, actionId, parameters);
    };

    const registerComponent = async (
      component: SharedApiComponent
    ): Promise<void> => {
      // Shapes are compatible enough; pass through directly
      // Host ApiProvider expects its own type, but fields align
      api.registerComponent(component as any);
    };

    const unregisterComponent = async (componentId: string): Promise<void> => {
      api.unregisterComponent(componentId);
    };

    const getComponents = async (): Promise<SharedApiComponent[]> => {
      return api.getComponents() as any;
    };

    const subscribeEvent = async (
      eventName: string,
      callback: (data: unknown) => void
    ): Promise<() => void> => {
      return eventBus.subscribe(eventName, callback);
    };

    const emitEvent = async (eventName: string, data?: unknown): Promise<void> => {
      eventBus.emit(eventName, data);
    };

    // MCP bridge not wired here; provide minimal no-op wrappers
    const sendMCPMessage = async (message: any): Promise<any> => {
      return {
        jsonrpc: '2.0',
        error: { code: -32601, message: 'MCP not available via Context client' },
        id: message?.id ?? null,
      };
    };

    const callMCPTool = async (
      toolName: string,
      args?: Record<string, unknown>
    ): Promise<any> => {
      return {
        jsonrpc: '2.0',
        error: { code: -32601, message: `Tool ${toolName} not available via Context client` },
        id: null,
      };
    };

    return {
      executeAction,
      registerComponent,
      unregisterComponent,
      getComponents,
      subscribeEvent,
      emitEvent,
      sendMCPMessage,
      callMCPTool,
    } as IApiClient;
  }, [api]);

  return <ApiClientProvider apiClient={client}>{children}</ApiClientProvider>;
};

