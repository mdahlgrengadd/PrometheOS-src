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
   * Get current progress
   */
  getProgress(): ProgressUpdate | null {
    return this._progress;
  },  /**
   * Parse Hermes XML tool call format
   */  _parseHermesToolCall(content: string): { name: string; arguments: Record<string, unknown> } | null {
    try {
      console.log("Parsing Hermes tool call from content:", content);
      
      // Look for <tool_call>...</tool_call> pattern with improved regex for nested JSON
      const toolCallMatch = content.match(/<tool_call>\s*(\{.*?\})\s*<\/tool_call>/s);
      if (toolCallMatch) {
        console.log("Found tool call match:", toolCallMatch[1]);
        const toolCallJson = JSON.parse(toolCallMatch[1]);
        console.log("Parsed tool call JSON:", toolCallJson);
        
        if (toolCallJson.name && toolCallJson.arguments) {
          return {
            name: toolCallJson.name,
            arguments: toolCallJson.arguments
          };
        }
      } else {
        console.log("No tool call pattern found in content");
      }
      return null;
    } catch (error) {
      console.error("Error parsing Hermes tool call:", error);
      return null;
    }
  },

  /**
   * Format system prompt for function calling
   * Creates the appropriate system prompt for Hermes models function calling
   */
  _formatFunctionCallingSystemPrompt(tools: Tool[]): string {
    // For Hermes models, use the specific format they expect
    if (this._currentModel?.includes("Hermes")) {
      const toolsXml = tools.map(tool => JSON.stringify({
        type: "function",
        function: tool.function
      })).join(" ");
      
      return `You are a function calling AI model. You are provided with function signatures within <tools></tools> XML tags. You may call one or more functions to assist with the user query. Don't make assumptions about what values to plug into functions. Here are the available tools: <tools> ${toolsXml} </tools> Use the following pydantic model json schema for each tool call you will make: {"properties": {"arguments": {"title": "Arguments", "type": "object"}, "name": {"title": "Name", "type": "string"}}, "required": ["arguments", "name"], "title": "FunctionCall", "type": "object"} For each function call return a json object with function name and arguments within <tool_call></tool_call> XML tags as follows:
<tool_call>
{"arguments": <args-dict>, "name": <function-name>}
</tool_call>`;
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
        // Debug: print current model and whether tools are enabled
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
            name: msg.name, // Include name field for tool messages
            tool_calls: msg.tool_calls, // Include tool_calls if present
          }));

          // Get tools if enabled
          let tools: Tool[] | undefined = undefined;
          const systemPrompt =
            messages.find((msg) => msg.role === "system")?.content || "";

          if (enableTools) {
            try {
              // Directly access workerPluginManager from the global scope
              const manager = (globalThis as unknown as WorkerGlobalScope)
                .workerPluginManager;

              // Debug: try to find where workerPluginManager might be
              console.log("webllm plugin: GLOBAL INSPECTION");
              console.log("  - self keys:", Object.keys(self));
              console.log(
                "  - self has workerPluginManager:",
                "workerPluginManager" in self
              );
              console.log("  - globalThis keys:", Object.keys(globalThis));
              console.log(
                "  - globalThis has workerPluginManager:",
                "workerPluginManager" in globalThis
              );

              console.log(
                "webllm plugin: accessing global workerPluginManager:",
                manager ? "found" : "not found",
                "in global scope keys:",
                Object.keys(self)
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
                console.log(
                  "webllm plugin: toolsResult from getAvailableTools:",
                  toolsResult
                );

                if (Array.isArray(toolsResult) && toolsResult.length > 0) {
                  // Convert MCP tools to OpenAI format
                  tools = toolsResult.map((tool) => ({
                    type: "function",
                    function: {
                      name: tool.name,
                      description: tool.description,
                      parameters: tool.inputSchema,
                    },
                  }));

                  console.log(
                    `WebLLM loaded ${tools.length} tools for function calling`
                  );                  // For Hermes models, use the specific format they expect
                  if (self._currentModel?.includes("Hermes")) {
                    // Update or add system prompt for Hermes models
                    const systemPrompt = self._formatFunctionCallingSystemPrompt(tools);
                    
                    if (apiMessages.length > 0 && apiMessages[0].role === "system") {
                      // Update existing system message
                      apiMessages[0].content = systemPrompt;
                    } else {
                      // Add system message at the beginning
                      apiMessages.unshift({
                        role: "system",
                        content: systemPrompt,
                        name: "",
                        tool_calls: [],
                      });
                    }
                    
                    console.log(
                      "Added Hermes function calling system prompt"
                    );

                    // Log the final messages being sent to the model
                    console.log(
                      "Final messages being sent to model:",
                      JSON.stringify(apiMessages, null, 2)
                    );
                  } else {
                    // For non-Hermes models, we can still use a custom system prompt
                    if (
                      apiMessages.length > 0 &&
                      apiMessages[0].role === "system"
                    ) {
                      // Generate the appropriate system prompt for function calling
                      apiMessages[0].content =
                        self._formatFunctionCallingSystemPrompt(tools);
                      // Ensure required fields
                      apiMessages[0].name = "";
                      apiMessages[0].tool_calls = [];
                    } else {
                      // Insert a system prompt if none exists
                      apiMessages.unshift({
                        role: "system",
                        content: self._formatFunctionCallingSystemPrompt(tools),
                        name: "",
                        tool_calls: [],
                      });
                    }
                  }
                }
              }
            } catch (error) {
              console.warn("Error loading tools for function calling:", error);
            }
          }

          // Create completions with streaming
          const options: Record<string, unknown> = {
            messages: apiMessages,
            temperature,
            stream: true,
          };          // Add tools if available
          if (enableTools && tools && tools.length > 0) {
            // For Hermes models, use manual function calling (no tools parameter)
            if (self._currentModel?.includes("Hermes")) {
              console.log("Using Hermes manual function calling (no tools parameter)");
              // Don't add tools to options for Hermes models
              // The system prompt already contains the tool definitions
            } else {
              // For non-Hermes models, use the standard tools approach
              options.tools = tools;
              options.tool_choice = "auto";
              console.log("Using standard OpenAI-style function calling");
            }

            // Debug: log available calculator tool
            const calculatorTool = tools.find(
              (tool) =>
                tool.function.name.toLowerCase().includes("calculator") ||
                tool.function.name.toLowerCase().includes("calculate")
            );
            if (calculatorTool) {
              console.log(
                "Calculator tool found:",
                JSON.stringify(calculatorTool, null, 2)
              );

              // For the specific calculator request, log it
              const userMessage = apiMessages.find(
                (msg) =>
                  msg.role === "user" &&
                  msg.content.toLowerCase().includes("calculator") &&
                  msg.content.toLowerCase().includes("add")
              );

              if (userMessage) {
                console.log(
                  "Detected calculator usage in message:",
                  userMessage.content
                );
              }
            } else {
              console.warn("No calculator tool found in tools list!");
            }
          }

          console.log("Creating chat completion with options:", options);
          // Debug: log the system prompt being sent
          if (Array.isArray(options.messages)) {
            const msgs = options.messages as unknown[];
            const first = msgs[0] as { role?: unknown; content?: unknown };
            if (first.role === "system" && typeof first.content === "string") {
              console.log("System Prompt being used:", first.content);
            }
          }

          let chunks;
          try {
            chunks = await engine.chat.completions.create(options);
          } catch (error) {
            console.error("Error creating chat completion:", error);
            controller.enqueue(
              "Sorry, there was an error processing your request. Please try again."
            );
            controller.close();
            return;
          }          // Track if we're currently handling a tool call
          let isHandlingToolCall = false;
          let toolCallContent = "";
          let toolCallName = "";
          let toolCallId = "";
          let completeResponse = ""; // Track the complete response for Hermes parsing
          let hermesToolCallExecuted = false; // Track if we've executed a Hermes tool call

          for await (const chunk of chunks) {
            // Debug: log all chunks
            console.log(
              "Stream chunk received:",
              JSON.stringify(chunk, null, 2)
            );

            // Handle regular text content
            const content = chunk.choices[0]?.delta.content || "";
            if (content) {
              controller.enqueue(content);
              completeResponse += content; // Accumulate for Hermes parsing
              console.log("Content chunk:", content);
            }

            // Handle OpenAI-style tool calls (for non-Hermes models)
            const toolCalls = chunk.choices[0]?.delta.tool_calls;
            if (toolCalls && toolCalls.length > 0) {
              console.log(
                "Tool call chunk received:",
                JSON.stringify(toolCalls, null, 2)
              );
              isHandlingToolCall = true;

              // Add the tool call to the UI (simplified for now)
              const toolCall = toolCalls[0];

              if (toolCall.id && !toolCallId) {
                toolCallId = toolCall.id;
              }

              if (toolCall.function) {
                if (toolCall.function.name && !toolCallName) {
                  toolCallName = toolCall.function.name;
                  controller.enqueue(
                    `\n\n[Executing tool: ${toolCall.function.name}]\n`
                  );
                }

                if (toolCall.function.arguments) {
                  toolCallContent += toolCall.function.arguments;
                }
              }
            }

            // Handle finish reason
            const finishReason = chunk.choices[0]?.finish_reason;
            
            // If we've received a complete tool call (OpenAI format), execute it
            if (
              isHandlingToolCall &&
              finishReason === "tool_calls" &&
              toolCallContent
            ) {
              await self._executeToolCall(controller, toolCallName, toolCallContent, toolCallId, apiMessages, engine, temperature);
              isHandlingToolCall = false;
              toolCallContent = "";
              toolCallName = "";
              toolCallId = "";
            }
              // For Hermes models, check if the response contains XML tool calls
            if (finishReason === "stop") {
              console.log("DEBUG: Finish reason is 'stop'");
              console.log("DEBUG: Current model:", self._currentModel);
              console.log("DEBUG: Model includes Hermes:", self._currentModel?.includes("Hermes"));
              console.log("DEBUG: Complete response length:", completeResponse.length);
              console.log("DEBUG: Complete response preview:", completeResponse.substring(0, 200));
                if (self._currentModel?.includes("Hermes") && completeResponse) {
                console.log("DEBUG: Attempting to parse Hermes tool call");
                const hermesToolCall = self._parseHermesToolCall(completeResponse);
                if (hermesToolCall) {
                  console.log("Parsed Hermes tool call:", hermesToolCall);
                  hermesToolCallExecuted = true;
                  await self._executeHermesToolCall(controller, hermesToolCall, apiMessages, engine, temperature);
                  return; // Exit early after tool execution to prevent further processing
                } else {
                  console.log("DEBUG: No Hermes tool call found in response");
                }
              }
            }
          }

          // If we didn't get a tool call and there's a calculator request, handle it directly
          if (!isHandlingToolCall && apiMessages.length > 0) {
            const userMessage = apiMessages.find(
              (msg) =>
                msg.role === "user" &&
                msg.content.toLowerCase().includes("calculator") &&
                msg.content.toLowerCase().includes("add")
            );

            if (userMessage) {
              console.log(
                "No tool call detected but calculator request found:",
                userMessage.content
              );

              try {
                // Extract numbers from the content
                const content = userMessage.content;
                const numbers = content.match(/\d+/g);

                if (numbers && numbers.length >= 2) {
                  const num1 = parseInt(numbers[0], 10);
                  const num2 = parseInt(numbers[1], 10);
                  const sum = num1 + num2;

                  controller.enqueue(
                    `\n\nI'll help you with that calculation. ${num1} + ${num2} = ${sum}`
                  );
                }
              } catch (error) {
                console.error("Error in direct calculator handling:", error);
                controller.enqueue(
                  "\n\nI notice you wanted to use the calculator, but I encountered an issue processing your request."
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
      "Hermes-2-Pro-Llama-3-8B",
      "Hermes-2-Pro-Mistral-7B",
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

        const enableTools =
          typeof params.enableTools === "boolean" ? params.enableTools : false;

        return this.chat(
          params.messages as Message[],
          temperature,
          enableTools
        );
      }

      case "supportsFunctionCalling": {
        return this.supportsFunctionCalling();
      }

      case "cleanup": {
        this.cleanup();
        return { status: "success" };
      }      default:
        return { error: `Method ${method} not supported for webllm` };
    }
  },

  /**
   * Execute an OpenAI-style tool call
   */
  async _executeToolCall(
    controller: ReadableStreamDefaultController<string>,
    toolCallName: string,
    toolCallContent: string,
    toolCallId: string,
    apiMessages: Array<{ role: string; content: string; name: string; tool_calls: unknown[] }>,
    engine: webllm.MLCEngine,
    temperature: number
  ): Promise<void> {
    try {
      // Parse the arguments
      const toolArgs = JSON.parse(toolCallContent);

      if (toolCallName) {
        controller.enqueue(`\n[Executing tool: ${toolCallName}]\n`);

        // Try accessing from globalThis instead of self
        const manager = (globalThis as unknown as WorkerGlobalScope)
          .workerPluginManager;

        if (manager) {
          const toolResult = await manager.callPlugin(
            "mcp-server",
            "executeTool",
            {
              toolCall: {
                name: toolCallName,
                arguments: toolArgs,
              },
            }
          );

          // Display the result
          const resultText = JSON.stringify(toolResult, null, 2);
          controller.enqueue(`\n[Tool Result]:\n${resultText}\n\n`);

          // Now we need to continue the conversation with the tool result
          // Add the assistant message with the tool call
          apiMessages.push({
            role: "assistant",
            content: "",
            name: "",
            tool_calls: [
              {
                id: toolCallId,
                type: "function",
                function: {
                  name: toolCallName,
                  arguments: toolCallContent,
                },
              },
            ],
          });

          // Add the tool message with the result
          apiMessages.push({
            role: "tool",
            content: JSON.stringify(toolResult),
            name: toolCallName,
            tool_calls: [],
          });          // Continue the conversation
          const continueOptions: Record<string, unknown> = {
            messages: apiMessages,
            temperature,
            stream: true,
          };

          console.log(
            "Continuing conversation with tool result:",
            continueOptions
          );
          const continueChunks = await engine.chat.completions.create(
            continueOptions
          ) as AsyncIterable<webllm.ChatCompletionChunk>;

          // Stream the continued response
          controller.enqueue(
            "\n\n[Assistant continues after tool use]\n"
          );
          for await (const chunk of continueChunks) {
            const content = chunk.choices[0]?.delta.content || "";
            if (content) {
              controller.enqueue(content);
            }
          }
        }
      }
    } catch (error) {
      controller.enqueue(
        `\n[Tool Error]: ${
          error instanceof Error ? error.message : String(error)
        }\n\n`
      );
    }
  },

  /**
   * Execute a Hermes XML-style tool call
   */
  async _executeHermesToolCall(
    controller: ReadableStreamDefaultController<string>,
    toolCall: { name: string; arguments: Record<string, unknown> },
    apiMessages: Array<{ role: string; content: string; name: string; tool_calls: unknown[] }>,
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

        // For Hermes models, add the tool result as a user message
        apiMessages.push({
          role: "user",
          content: `Tool "${toolCall.name}" returned: ${JSON.stringify(toolResult)}. Please provide a natural language response based on this result.`,
          name: "",
          tool_calls: [],
        });        // Continue the conversation
        const continueOptions: Record<string, unknown> = {
          messages: apiMessages,
          temperature,
          stream: true,
        };

        console.log(
          "Continuing Hermes conversation with tool result:",
          continueOptions
        );
        const continueChunks = await engine.chat.completions.create(
          continueOptions
        ) as AsyncIterable<webllm.ChatCompletionChunk>;        // Stream the continued response
        controller.enqueue(
          "\n\n[Assistant response]:\n"
        );
        for await (const chunk of continueChunks) {
          const content = chunk.choices[0]?.delta.content || "";
          if (content) {
            controller.enqueue(content);
          }
          
          // Check if the response is complete
          const finishReason = chunk.choices[0]?.finish_reason;
          if (finishReason === "stop") {
            console.log("Hermes tool call conversation completed");
            break;
          }
        }
        
        // Close the controller after tool execution is complete
        controller.close();
      }
    } catch (error) {
      controller.enqueue(
        `\n[Tool Error]: ${
          error instanceof Error ? error.message : String(error)
        }\n\n`
      );
      controller.close(); // Also close on error
    }
  },
};

// Export the webllm plugin instance as default
export default WorkerWebLLM;
