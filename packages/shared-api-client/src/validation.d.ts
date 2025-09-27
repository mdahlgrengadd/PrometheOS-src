export declare function registerActionSchema(componentId: string, actionId: string, schema: any): void;
export declare function validateParameters(componentId: string, actionId: string, parameters?: Record<string, unknown>): Promise<Record<string, unknown>>;
export declare const SYSTEM_SCHEMAS: {
    'sys.open': {
        type: string;
        properties: {
            name: {
                type: string;
                pattern: string;
                maxLength: number;
            };
            initFromUrl: {
                type: string;
                maxLength: number;
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
    'sys.kill': {
        type: string;
        properties: {
            name: {
                type: string;
                pattern: string;
                maxLength: number;
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
    'sys.notify': {
        type: string;
        properties: {
            message: {
                type: string;
                maxLength: number;
            };
            type: {
                type: string;
                enum: string[];
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
    'sys.dialog': {
        type: string;
        properties: {
            title: {
                type: string;
                maxLength: number;
            };
            description: {
                type: string;
                maxLength: number;
            };
            confirmLabel: {
                type: string;
                maxLength: number;
            };
            cancelLabel: {
                type: string;
                maxLength: number;
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
    'sys.events.waitFor': {
        type: string;
        properties: {
            name: {
                type: string;
                pattern: string;
                maxLength: number;
            };
            timeout: {
                type: string;
                minimum: number;
                maximum: number;
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
};
export declare function initializeSystemSchemas(): void;
