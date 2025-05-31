// Type declarations for JavaScript modules

declare module "./modelConfig" {
  export function createAppConfig(): {
    model_list: Array<{
      model_id: string;
      model: string;
      model_lib: string;
      vram_required_MB: number;
      low_resource_required: boolean;
      required_features?: string[];
      overrides?: {
        context_window_size: number;
        prefill_chunk_size: number;
      };
    }>;
  };
  export const defaultModelId: string;
}

declare module "./toolHandler" {
  export class ToolHandler {
    constructor(model: string);
    createSystemPrompt(tools: unknown[]): string;
    checkResponse(message: string): {
      error?: string;
      tool_call?: string;
      func?: {
        name: string;
        arguments: Record<string, unknown>;
      };
    } | null;
    qwen_template: string;
    hermes3_template: string;
  }
}

declare module "./toolImplementations" {
  export function fetch_wikipedia_content(searchQuery: string): Promise<{
    status: string;
    content?: string;
    title?: string;
    message?: string;
  }>;

  export function sparql_exec(query: string): Promise<{
    error?: string;
    results?: unknown;
  }>;
}

declare module "./tools" {
  export const tools: Array<{
    type: string;
    function: {
      name: string;
      description: string;
      parameters: {
        type: string;
        properties: Record<
          string,
          {
            type: string;
            description: string;
          }
        >;
        required: string[];
      };
      return?: {
        type: string;
        description: string;
      };
    };
  }>;
}
