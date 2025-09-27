export interface IApiParameter {
    name: string;
    type: string;
    description?: string;
    required?: boolean;
    enum?: string[];
}
export interface IApiAction {
    id: string;
    name: string;
    description: string;
    available: boolean;
    parameters?: IApiParameter[];
}
export interface IApiComponent {
    id: string;
    type: string;
    name: string;
    description: string;
    path: string;
    actions: IApiAction[];
    state: {
        enabled: boolean;
        visible?: boolean;
        [key: string]: unknown;
    };
}
export interface IActionResult {
    success: boolean;
    data?: unknown;
    error?: string;
}
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
export interface IApiClient {
    executeAction(componentId: string, actionId: string, parameters?: Record<string, unknown>): Promise<IActionResult>;
    registerComponent(component: IApiComponent): Promise<void>;
    unregisterComponent(componentId: string): Promise<void>;
    getComponents(): Promise<IApiComponent[]>;
    subscribeEvent(eventName: string, callback: (data: unknown) => void): Promise<() => void>;
    emitEvent(eventName: string, data?: unknown): Promise<void>;
    getEventNames(): Promise<string[]>;
    sendMCPMessage(message: MCPRequest): Promise<MCPResponse>;
}
export interface IHostApiBridge {
    executeAction(componentId: string, actionId: string, parameters?: Record<string, unknown>): Promise<IActionResult>;
    registerRemoteComponent(remoteId: string, component: IApiComponent): Promise<void>;
    subscribeEvent(eventName: string, callback: (data: unknown) => void): Promise<() => void>;
    emitEvent(eventName: string, data?: unknown): Promise<void>;
}
