/**
 * Worker-specific WebLLM plugin implementation that doesn't depend on React or DOM
 * This handles all the model loading and inference logic
 */

import * as webllm from '@mlc-ai/web-llm';

import { WorkerPlugin } from '../../plugins/types';

// Interface for progress updates
export interface ProgressUpdate {
  text: string;
  progress: number;
}

// Define message interface (same as in UI)
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
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
   * Get current progress
   */
  getProgress(): ProgressUpdate | null {
    return this._progress;
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

    return new ReadableStream<string>({
      async start(controller) {
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
          }));

          // Get tools if enabled
          let tools = undefined;

          if (enableTools) {
            try {
              // Access the worker plugin manager to get MCP tools
              const workerPluginManagerGlobal = self as unknown as {
                workerPluginManager?: {
                  callPlugin: (
                    pluginId: string,
                    method: string,
                    params?: Record<string, unknown>
                  ) => Promise<unknown>;
                };
              };

              const manager = workerPluginManagerGlobal.workerPluginManager;
              if (manager) {
                // Ensure MCP server is initialized
                await manager.callPlugin("mcp-server", "initialize");

                // Get available tools
                const toolsResult = await manager.callPlugin(
                  "mcp-server",
                  "getAvailableTools"
                );

                if (Array.isArray(toolsResult)) {
                  tools = toolsResult;
                  console.log(
                    `WebLLM loaded ${tools.length} tools for function calling`
                  );
                }
              }
            } catch (error) {
              console.warn("Error loading tools for function calling:", error);
            }
          }

          // Create completions with streaming
          const options: Record<string, any> = {
            messages: apiMessages,
            temperature,
            stream: true,
          };

          // Add tools if available
          if (enableTools && tools && tools.length > 0) {
            options.tools = tools;
            options.tool_choice = "auto";
          }

          console.log("Creating chat completion with options:", options);
          const chunks = await engine.chat.completions.create(options);

          // Track if we're currently handling a tool call
          let isHandlingToolCall = false;
          let toolCallContent = "";

          for await (const chunk of chunks) {
            // Handle regular text content
            const content = chunk.choices[0]?.delta.content || "";
            if (content) {
              controller.enqueue(content);
            }

            // Handle tool calls
            const toolCalls = chunk.choices[0]?.delta.tool_calls;
            if (toolCalls && toolCalls.length > 0) {
              isHandlingToolCall = true;

              // Add the tool call to the UI (simplified for now)
              const toolCall = toolCalls[0];

              if (toolCall.function) {
                if (toolCall.function.name) {
                  controller.enqueue(
                    `\n\n[Tool Call: ${toolCall.function.name}]\n`
                  );
                }

                if (toolCall.function.arguments) {
                  toolCallContent += toolCall.function.arguments;
                }
              }
            }

            // If we've received a complete tool call, execute it
            if (
              isHandlingToolCall &&
              chunk.choices[0]?.finish_reason === "tool_calls" &&
              toolCallContent
            ) {
              isHandlingToolCall = false;

              try {
                // Parse the arguments
                const toolArgs = JSON.parse(toolCallContent);
                toolCallContent = "";

                // Extract tool name from the last message
                const toolName =
                  chunk.choices[0].message?.tool_calls?.[0]?.function.name;

                if (toolName) {
                  controller.enqueue(`\n[Executing tool: ${toolName}]\n`);

                  // Call the tool via MCP server
                  const workerPluginManagerGlobal = self as unknown as {
                    workerPluginManager?: {
                      callPlugin: (
                        pluginId: string,
                        method: string,
                        params?: Record<string, unknown>
                      ) => Promise<unknown>;
                    };
                  };

                  const manager = workerPluginManagerGlobal.workerPluginManager;
                  if (manager) {
                    const toolResult = await manager.callPlugin(
                      "mcp-server",
                      "executeTool",
                      {
                        toolCall: {
                          name: toolName,
                          arguments: toolArgs,
                        },
                      }
                    );

                    // Display the result
                    const resultText = JSON.stringify(toolResult, null, 2);
                    controller.enqueue(`\n[Tool Result]:\n${resultText}\n\n`);
                  }
                }
              } catch (error) {
                controller.enqueue(
                  `\n[Tool Error]: ${
                    error instanceof Error ? error.message : String(error)
                  }\n\n`
                );
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error("Error generating response:", error);
          controller.error(error);
        }
      },
    });
  },

  /**
   * Check if the current model supports function calling (tool use)
   */
  supportsFunctionCalling(): boolean {
    // Models known to support function calling
    const supportedModels = [
      "Llama-3.1-8B",
      "Llama-3.1-70B",
      "Phi-3-mini-4k-instruct",
      "Phi-3-medium-4k-instruct",
    ];

    return (
      this._currentModel !== null &&
      supportedModels.some((model) =>
        this._currentModel?.toLowerCase().includes(model.toLowerCase())
      )
    );
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
   * Generic handler function that processes method calls with parameters
   */
  handle(method: string, params?: Record<string, unknown>): unknown {
    switch (method) {
      case "loadModel": {
        if (!params || typeof params.modelName !== "string") {
          return { error: "Invalid parameters for loadModel" };
        }
        return this.loadModel(params.modelName);
      }

      case "getProgress": {
        return this.getProgress();
      }

      case "chat": {
        if (!params || !Array.isArray(params.messages)) {
          return { error: "Invalid parameters for chat" };
        }

        const temperature =
          typeof params.temperature === "number" ? params.temperature : 0.7;

        return this.chat(params.messages as Message[], temperature);
      }

      case "cleanup": {
        this.cleanup();
        return { status: "success" };
      }

      default:
        return { error: `Method ${method} not supported for webllm` };
    }
  },
};

// Export the webllm plugin instance as default
export default WorkerWebLLM;
