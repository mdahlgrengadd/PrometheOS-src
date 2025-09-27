import React from 'react';
import { IApiClient, IApiComponent, IActionResult } from './types';
export declare const ApiClientProvider: React.FC<{
    children: React.ReactNode;
    apiClient?: IApiClient;
}>;
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
