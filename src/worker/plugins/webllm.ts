/**
 * Worker-specific WebLLM plugin implementation that doesn't depend on React or DOM
 * This handles all the model loading and inference logic
 */

import * as webllm from "@mlc-ai/web-llm";

import { WorkerPlugin } from "../../plugins/types";

// Interface for progress updates
export interface ProgressUpdate {
  text: string;
  progress: number;
}

// Define message interface (same as in UI)
export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string; // Used for tool messages
  tool_calls?: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

// Define tool interfaces
export interface Tool {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

// Define a proper interface for the global worker scope
interface WorkerGlobalScope extends Window {
  workerPluginManager?: {
    callPlugin: (
      pluginId: string,
      method: string,
      params?: Record<string, unknown>
    ) => Promise<unknown>;
  };
}

/**
 * WebLLM plugin implementation for worker
 */
const WorkerWebLLM: WorkerPlugin = {
  id: "webllm",

  // Private state
  _engine: null as webllm.MLCEngine | null,
  _currentModel: null as string | null,
  _progress: null as ProgressUpdate | null,

  /**
   * Load a model with progress updates
   */
  async loadModel(
    modelName: string
  ): Promise<{ status: string; message?: string }> {
    try {
      // Clean up existing engine if needed
      if (this._engine) {
        // Clean up old engine resources if any
        this.cleanup();
      }

      this._currentModel = modelName;
      this._progress = {
        text: "Starting model initialization...",
        progress: 0,
      };

      // Initialize engine with progress callback
      this._engine = await webllm.CreateMLCEngine(modelName, {
        initProgressCallback: (progress) => {
          this._progress = {
            text: progress.text || "Initializing...",
            progress: progress.progress,
          };
        },
      });

      return { status: "success" };
    } catch (error) {
      console.error("Error initializing model:", error);
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: "error",
        message,
      };
    }
  },

  /**
   * Get current model loading progress
   */
  getProgress(): ProgressUpdate | null {
    return this._progress;
  },

  /**
   * Get currently loaded model name
   */
  getCurrentModel(): string | null {
    return this._currentModel;
  },

  /**
   * Clean up resources
   */
  cleanup(): void {
    this._engine = null;
    this._currentModel = null;
    this._progress = null;
  },

  /**
   * Check if model is loaded
   */
  isModelLoaded(): boolean {
    return this._engine !== null;
  },

  /**
   * Parse Hermes tool call from response content
   */
  _parseHermesToolCall(
    content: string
  ): { name: string; arguments: Record<string, unknown> } | null {
    // Look for <tool_call>...</tool_call> pattern
    const toolCallMatch = content.match(
      /<tool_call>\s*({.*?})\s*<\/tool_call>/s
    );
    if (!toolCallMatch) {
      return null;
    }

    try {
      const toolCallData = JSON.parse(toolCallMatch[1]);
      return {
        name: toolCallData.name,
        arguments: toolCallData.arguments || {},
      };
    } catch (error) {
      console.error("Error parsing Hermes tool call:", error);
      return null;
    }
  },

  /**
   * Parse Llama 3.1 function call from response content
   */
  _parseLlamaFunctionCall(
    content: string
  ): { name: string; arguments: Record<string, unknown> } | null {
    // Look for <function>...</function> pattern
    const functionMatch = content.match(/<function>\s*({.*?})\s*<\/function>/s);
    if (!functionMatch) {
      return null;
    }

    try {
      const functionData = JSON.parse(functionMatch[1]);
      return {
        name: functionData.name,
        arguments: functionData.parameters || {},
      };
    } catch (error) {
      console.error("Error parsing Llama function call:", error);
      return null;
    }
  },

  /**
   * Format system prompt for function calling based on model type
   */
  _formatFunctionCallingSystemPrompt(tools: Tool[], modelName: string): string {
    const toolsFormatted = tools.map((tool) => JSON.stringify(tool)).join(" ");

    // Check if this is a Hermes model
    if (
      modelName &&
      (modelName.includes("Hermes") ||
        modelName.includes("hermes") ||
        modelName.includes("Theta") ||
        modelName.includes("Pro"))
    ) {
      // Use exact Hermes format from official manual
      return `You are a function calling AI model. You are provided with function signatures within <tools></tools> XML tags. You may call one or more functions to assist with the user query. Don't make assumptions about what values to plug into functions. Here are the available tools: <tools> ${toolsFormatted} </tools> Use the following pydantic model json schema for each tool call you will make: {"properties": {"arguments": {"title": "Arguments", "type": "object"}, "name": {"title": "Name", "type": "string"}}, "required": ["arguments", "name"], "title": "FunctionCall", "type": "object"} For each function call return a json object with function name and arguments within <tool_call></tool_call> XML tags as follows:
<tool_call>
{"arguments": <args-dict>, "name": <function-name>}
</tool_call>`;
    }

    // Check if this is a Llama 3.1 model
    if (
      modelName &&
      (modelName.includes("Llama-3.1") ||
        modelName.includes("llama-3.1") ||
        modelName.includes("Llama3.1"))
    ) {
      // Use exact Llama 3.1 format from official manual
      return `Cutting Knowledge Date: December 2023
Today Date: 23 Jul 2024
# Tool Instructions
- When looking for real time information use relevant functions if available
You have access to the following functions:

${toolsFormatted}
If a you choose to call a function ONLY reply in the following format:
    <function>{"name": function name, "parameters": dictionary of argument name and its value}</function>
Here is an example,
    <function>{"name": "example_function_name", "parameters": {"example_name": "example_value"}}</function>
Reminder:
- Function calls MUST follow the specified format and use BOTH <function> and </function>
- Required parameters MUST be specified
- Only call one function at a time
- When calling a function, do NOT add any other words, ONLY the function calling
- Put the entire function call reply on one line
- Always add your sources when using search results to answer the user query
You are a helpful Assistant.`;
    }

    // Default format for other models
    const toolsString = JSON.stringify(tools);
    return `You are a helpful AI assistant with access to the following tools: ${toolsString}. When you need to use a tool, output the tool call in JSON format.`;
  },

  /**
   * Chat with the model, returning a ReadableStream of response chunks
   */
  chat(
    messages: Message[],
    temperature: number = 0.7,
    enableTools: boolean = false
  ): ReadableStream<string> {
    const engine = this._engine;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    return new ReadableStream<string>({
      async start(controller) {
        console.log(
          "WebLLM chat invoked. currentModel=",
          self._currentModel,
          "enableTools=",
          enableTools
        );
        if (!engine) {
          controller.error(
            new Error("Model not loaded. Please load a model first.")
          );
          return;
        }

        try {
          // Convert messages to format expected by webllm
          const apiMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            name: msg.name,
            tool_calls: msg.tool_calls,
          })); // Get tools if enabled
          let tools: Tool[] | undefined = undefined;
          const modifiedMessages = [...apiMessages];

          if (enableTools) {
            try {
              const manager = (globalThis as unknown as WorkerGlobalScope)
                .workerPluginManager;

              console.log(
                "webllm plugin: accessing global workerPluginManager:",
                manager ? "found" : "not found"
              );

              if (manager) {
                // Initialize MCP server
                console.log("webllm plugin: initializing mcp-server");
                await manager.callPlugin("mcp-server", "initialize");
                console.log("webllm plugin: mcp-server initialized");

                // Fetch available tools
                const toolsResult = await manager.callPlugin(
                  "mcp-server",
                  "getAvailableTools"
                );
                console.log("webllm plugin: available tools:", toolsResult);

                if (toolsResult && Array.isArray(toolsResult)) {
                  tools = toolsResult as Tool[];

                  // Update system message with tool information
                  const systemPrompt = self._formatFunctionCallingSystemPrompt(
                    tools,
                    self._currentModel || ""
                  );

                  // Replace or add system message
                  const systemMessageIndex = modifiedMessages.findIndex(
                    (msg) => msg.role === "system"
                  );
                  if (systemMessageIndex >= 0) {
                    modifiedMessages[systemMessageIndex] = {
                      role: "system",
                      content: systemPrompt,
                      name: "",
                      tool_calls: [],
                    };
                  } else {
                    modifiedMessages.unshift({
                      role: "system",
                      content: systemPrompt,
                      name: "",
                      tool_calls: [],
                    });
                  }
                }
              }
            } catch (error) {
              console.error("Error setting up tools:", error);
              controller.enqueue(
                `\n[Tool Setup Error]: ${
                  error instanceof Error ? error.message : String(error)
                }\n\n`
              );
            }
          }

          // Make initial request - following official manual: use non-streaming
          const request: webllm.ChatCompletionRequest = {
            stream: false, // Use non-streaming like official examples
            messages: modifiedMessages as webllm.ChatCompletionMessageParam[],
            temperature,
          };

          console.log("Making WebLLM request:", request);

          const reply = await engine.chat.completions.create(request);
          const response = reply.choices[0].message.content;

          console.log("WebLLM response:", response);

          if (!response) {
            controller.enqueue("[No response generated]");
            controller.close();
            return;
          }

          // Check for tool calls if tools are enabled
          if (enableTools && tools && tools.length > 0) {
            // Check for Hermes tool call format
            const hermesToolCall = self._parseHermesToolCall(response);
            if (hermesToolCall) {
              controller.enqueue(`[Assistant]: ${response}\n\n`);
              await self._executeHermesToolCall(
                controller,
                hermesToolCall,
                modifiedMessages,
                engine,
                temperature
              );
              return;
            }

            // Check for Llama 3.1 function call format
            const llamaFunctionCall = self._parseLlamaFunctionCall(response);
            if (llamaFunctionCall) {
              controller.enqueue(`[Assistant]: ${response}\n\n`);
              await self._executeLlamaFunctionCall(
                controller,
                llamaFunctionCall,
                modifiedMessages,
                engine,
                temperature
              );
              return;
            }
          }

          // No tool call detected, just return the response
          controller.enqueue(response);
          controller.close();
        } catch (error) {
          console.error("Error in WebLLM chat:", error);
          controller.error(error);
        }
      },
    });
  },

  /**
   * Execute a Hermes tool call following the official manual pattern
   */
  async _executeHermesToolCall(
    controller: ReadableStreamDefaultController<string>,
    toolCall: { name: string; arguments: Record<string, unknown> },
    apiMessages: Array<{
      role: string;
      content: string;
      name: string;
      tool_calls: unknown[];
    }>,
    engine: webllm.MLCEngine,
    temperature: number
  ): Promise<void> {
    try {
      controller.enqueue(`\n\n[Executing tool: ${toolCall.name}]\n`);

      const manager = (globalThis as unknown as WorkerGlobalScope)
        .workerPluginManager;

      if (manager) {
        const toolResult = await manager.callPlugin(
          "mcp-server",
          "executeTool",
          {
            toolCall: {
              name: toolCall.name,
              arguments: toolCall.arguments,
            },
          }
        );

        // Display the result
        const resultText = JSON.stringify(toolResult, null, 2);
        controller.enqueue(`\n[Tool Result]:\n${resultText}\n\n`);

        // Following the official manual example: add tool response in the exact format
        const tool_response = `<tool_response>\n{"name": "${
          toolCall.name
        }", "content": ${JSON.stringify(toolResult)}}\n</tool_response>`;

        // Add the tool response message with tool role (following official pattern)
        apiMessages.push({
          role: "tool",
          content: tool_response,
          name: "",
          tool_calls: [],
        });

        // Continue the conversation to get natural language response using the exact format from manual
        const continueRequest: webllm.ChatCompletionRequest = {
          stream: false, // Use non-streaming like the official example
          messages: apiMessages as webllm.ChatCompletionMessageParam[],
          temperature,
        };

        console.log(
          "Continuing Hermes conversation with tool result:",
          continueRequest
        );

        const reply = await engine.chat.completions.create(continueRequest);
        const response = reply.choices[0].message.content;

        if (response) {
          controller.enqueue(`\n\n[Assistant response]:\n${response}`);

          // Add the assistant's response to the messages
          apiMessages.push({
            role: "assistant",
            content: response,
            name: "",
            tool_calls: [],
          });
        }

        console.log("Hermes tool call conversation completed");
        controller.close();
      }
    } catch (error) {
      controller.enqueue(
        `\n[Tool Error]: ${
          error instanceof Error ? error.message : String(error)
        }\n\n`
      );
      controller.close();
    }
  },

  /**
   * Execute a Llama 3.1 function call following the official manual pattern
   */
  async _executeLlamaFunctionCall(
    controller: ReadableStreamDefaultController<string>,
    functionCall: { name: string; arguments: Record<string, unknown> },
    apiMessages: Array<{
      role: string;
      content: string;
      name: string;
      tool_calls: unknown[];
    }>,
    engine: webllm.MLCEngine,
    temperature: number
  ): Promise<void> {
    try {
      controller.enqueue(`\n\n[Executing function: ${functionCall.name}]\n`);

      const manager = (globalThis as unknown as WorkerGlobalScope)
        .workerPluginManager;

      if (manager) {
        const toolResult = await manager.callPlugin(
          "mcp-server",
          "executeTool",
          {
            toolCall: {
              name: functionCall.name,
              arguments: functionCall.arguments,
            },
          }
        );

        // Display the result
        const resultText = JSON.stringify(toolResult, null, 2);
        controller.enqueue(`\n[Function Result]:\n${resultText}\n\n`);

        // Following the official manual example: add tool response in the exact format for Llama
        const tool_response = `{"output": ${JSON.stringify(toolResult)}}`;

        // Add the tool response message
        apiMessages.push({
          role: "tool",
          content: tool_response,
          name: "",
          tool_calls: [],
        });

        // Continue the conversation to get natural language response using the exact format from manual
        const continueRequest: webllm.ChatCompletionRequest = {
          stream: false, // Use non-streaming like the official example
          messages: apiMessages as webllm.ChatCompletionMessageParam[],
          temperature,
        };

        console.log(
          "Continuing Llama conversation with function result:",
          continueRequest
        );

        const reply = await engine.chat.completions.create(continueRequest);
        const response = reply.choices[0].message.content;

        if (response) {
          controller.enqueue(`\n\n[Assistant response]:\n${response}`);

          // Add the assistant's response to the messages
          apiMessages.push({
            role: "assistant",
            content: response,
            name: "",
            tool_calls: [],
          });
        }

        console.log("Llama function call conversation completed");
        controller.close();
      }
    } catch (error) {
      controller.enqueue(
        `\n[Function Error]: ${
          error instanceof Error ? error.message : String(error)
        }\n\n`
      );
      controller.close();
    }
  },

  /**
   * Check if the current model supports function calling
   */
  supportsFunctionCalling(): boolean {
    const modelName = this._currentModel;
    if (!modelName) return false;

    // Check for supported function calling models
    return (
      modelName.includes("Hermes") ||
      modelName.includes("hermes") ||
      modelName.includes("Theta") ||
      modelName.includes("Pro") ||
      modelName.includes("Llama-3.1") ||
      modelName.includes("llama-3.1") ||
      modelName.includes("Llama3.1")
    );
  },

  /**
   * Handle method calls from the main thread
   */ handle(method: string, params?: Record<string, unknown>): unknown {
    switch (method) {
      case "loadModel": {
        if (!params || typeof params.modelName !== "string") {
          throw new Error(
            "modelName parameter is required and must be a string"
          );
        }
        return this.loadModel(params.modelName);
      }

      case "chat": {
        if (!params || !Array.isArray(params.messages)) {
          throw new Error(
            "messages parameter is required and must be an array"
          );
        }
        const temperature =
          typeof params.temperature === "number" ? params.temperature : 0.7;
        const enableTools =
          typeof params.enableTools === "boolean" ? params.enableTools : false;
        return this.chat(
          params.messages as Message[],
          temperature,
          enableTools
        );
      }

      case "getProgress":
        return this.getProgress();

      case "getCurrentModel":
        return this.getCurrentModel();

      case "isModelLoaded":
        return this.isModelLoaded();

      case "supportsFunctionCalling":
        return this.supportsFunctionCalling();

      case "cleanup":
        this.cleanup();
        return;

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  },
};

// Export the webllm plugin instance as default
export default WorkerWebLLM;
