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
export interface IEventBus {
    emit(event: string, data?: any): void;
    on(event: string, listener: Function): void;
    off(event: string, listener: Function): void;
    subscribe(event: string, listener: Function): () => void;
}
export interface ITestingAPI {
    executeAction(componentId: string, actionId: string, params?: Record<string, unknown>): Promise<IActionResult>;
    listComponents(): IApiComponent[];
    getComponent(componentId: string): IApiComponent | undefined;
    textarea: {
        setValue(apiId: string, text: string): Promise<IActionResult>;
        getValue(apiId: string): Promise<IActionResult>;
        clear(apiId: string): Promise<IActionResult>;
        appendText(apiId: string, text: string): Promise<IActionResult>;
    };
    events: {
        emit(eventName: string, data?: unknown): Promise<void>;
        subscribe(eventName: string, callback?: (data: unknown) => void): Promise<() => void>;
    };
}
declare global {
    interface Window {
        /**
         * Module Federation Host API Bridge
         * Provides cross-remote API communication in federated environments
         */
        __HOST_API_BRIDGE__?: IHostApiBridge;
        /**
         * Remote Application Identifier
         * Set by host when loading remotes to identify the current remote context
         */
        __REMOTE_ID__?: string;
        /**
         * Global Event Bus
         * Shared event system exposed by host for cross-remote communication
         */
        eventBus?: IEventBus;
        /**
         * PrometheOS API Testing Interface
         * Global API for browser console testing and debugging
         */
        __PROMETHEOS_API__?: ITestingAPI;
    }
}
