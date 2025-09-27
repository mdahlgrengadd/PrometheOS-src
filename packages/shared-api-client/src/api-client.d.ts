import { IApiClient, IApiComponent, IActionResult, IHostApiBridge, MCPRequest, MCPResponse } from './types';
declare global {
    interface Window {
        __HOST_API_BRIDGE__?: IHostApiBridge;
        __REMOTE_ID__?: string;
    }
}
export declare class FederatedApiClient implements IApiClient {
    private hostBridge;
    private remoteId;
    private eventSubscriptions;
    constructor();
    executeAction(componentId: string, actionId: string, parameters?: Record<string, unknown>): Promise<IActionResult>;
    registerComponent(component: IApiComponent): Promise<void>;
    unregisterComponent(componentId: string): Promise<void>;
    getComponents(): Promise<IApiComponent[]>;
    subscribeEvent(eventName: string, callback: (data: unknown) => void): Promise<() => void>;
    emitEvent(eventName: string, data?: unknown): Promise<void>;
    getEventNames(): Promise<string[]>;
    sendMCPMessage(message: MCPRequest): Promise<MCPResponse>;
    listMCPTools(): Promise<any[]>;
    callMCPTool(toolName: string, arguments_?: Record<string, unknown>): Promise<any>;
}
export declare function getApiClient(): FederatedApiClient;
