// React hooks for API client integration
import React, { createContext, useContext, useEffect, useState } from 'react';
import { IApiClient, IApiComponent, IActionResult } from './types';
import { getApiClient } from './api-client';

// API Client Context
const ApiClientContext = createContext<IApiClient | null>(null);

// Provider component
export const ApiClientProvider: React.FC<{
  children: React.ReactNode;
  apiClient?: IApiClient;
}> = ({ children, apiClient }) => {
  const client = apiClient || getApiClient();

  return (
    <ApiClientContext.Provider value={client}>
      {children}
    </ApiClientContext.Provider>
  );
};

// Hook to use API client with graceful fallback
export function useApiClient(): IApiClient {
  const context = useContext(ApiClientContext);

  // First try context provider
  if (context) {
    return context;
  }

  // Fallback to host bridge if available
  if (typeof window !== 'undefined' && window.__HOST_API_BRIDGE__) {
    console.log('[API Client] Using host bridge fallback');
    return getApiClient();
  }

  // No API client available
  throw new Error('useApiClient must be used within an ApiClientProvider or host bridge must be available');
}

// Hook for executing API actions with React integration
export function useApiAction(
  componentId: string,
  actionId: string
): {
  execute: (params?: Record<string, unknown>) => Promise<IActionResult>;
  loading: boolean;
  error: string | null;
  result: unknown;
} {
  const apiClient = useApiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  const execute = async (params?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.executeAction(componentId, actionId, params);

      if (response.success) {
        setResult(response.data);
        setError(null);
      } else {
        setError(response.error || 'Action failed');
        setResult(null);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setResult(null);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, result };
}

// Hook for component registration
export function useComponentRegistration(component: IApiComponent): {
  registered: boolean;
  error: string | null;
} {
  const apiClient = useApiClient();
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const registerComponent = async () => {
      try {
        await apiClient.registerComponent(component);
        setRegistered(true);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setRegistered(false);
        console.error(`Failed to register component ${component.id}:`, err);
      }
    };

    registerComponent();

    // Cleanup on unmount
    return () => {
      apiClient.unregisterComponent(component.id).catch(console.error);
    };
  }, [apiClient, component]);

  return { registered, error };
}

// Hook for event subscription
export function useEventSubscription(
  eventName: string,
  callback: (data: unknown) => void,
  enabled: boolean = true
): {
  subscribed: boolean;
  error: string | null;
} {
  const apiClient = useApiClient();
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let unsubscribe: (() => void) | null = null;

    const subscribe = async () => {
      try {
        unsubscribe = await apiClient.subscribeEvent(eventName, callback);
        setSubscribed(true);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setSubscribed(false);
        console.error(`Failed to subscribe to event ${eventName}:`, err);
      }
    };

    subscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
        setSubscribed(false);
      }
    };
  }, [apiClient, eventName, callback, enabled]);

  return { subscribed, error };
}

// Hook for MCP tool usage
export function useMCPTool(toolName: string): {
  call: (args?: Record<string, unknown>) => Promise<any>;
  loading: boolean;
  error: string | null;
  result: unknown;
} {
  const apiClient = useApiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  const call = async (args?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.callMCPTool(toolName, args);
      setResult(response);
      setError(null);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setResult(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { call, loading, error, result };
}