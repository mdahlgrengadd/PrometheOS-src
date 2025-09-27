import React from 'react';
import { IApiClient, IApiComponent, IActionResult } from './types';
export declare const ApiClientProvider: React.FC<{
    children: React.ReactNode;
    apiClient?: IApiClient;
}>;
/**
 * Hook to access the API client with dual-pattern support
 *
 * Supports two patterns:
 * 1. React Context Pattern: Clean React integration via ApiClientProvider
 * 2. Module Federation Bridge Pattern: Cross-remote communication via window.__HOST_API_BRIDGE__
 *
 * @returns {IApiClient} The API client instance
 * @throws {Error} When neither pattern is available
 */
export declare function useApiClient(): IApiClient;
export declare function useApiAction(componentId: string, actionId: string): {
    execute: (params?: Record<string, unknown>) => Promise<IActionResult>;
    loading: boolean;
    error: string | null;
    result: unknown;
};
export declare function useComponentRegistration(component: IApiComponent): {
    registered: boolean;
    error: string | null;
};
export declare function useEventSubscription(eventName: string, callback: (data: unknown) => void, enabled?: boolean): {
    subscribed: boolean;
    error: string | null;
};
export declare function useMCPTool(toolName: string): {
    call: (args?: Record<string, unknown>) => Promise<any>;
    loading: boolean;
    error: string | null;
    result: unknown;
};
