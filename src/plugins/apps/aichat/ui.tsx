import * as webllm from "https://unpkg.com/@mlc-ai/web-llm@0.2.78";
import React, { useEffect, useRef, useState } from "react";

import { useApi } from "../../../api/context/ApiContext";
import { manifest } from "./manifest";
// Import model configuration
import { createAppConfig, defaultModelId } from "./modelConfig";
// Import tool handling infrastructure
import { ToolHandler } from "./toolHandler";
import { fetch_wikipedia_content, sparql_exec } from "./toolImplementations";
import { tools } from "./tools";

// Declare WebLLM types
declare global {
  interface Window {
    webllm: {
      MLCEngine: new (config: { appConfig: unknown }) => WebLLMEngine;
      prebuiltAppConfig: {
        model_list: Array<{ model_id: string }>;
      };
    };
  }
}

interface WebLLMEngine {
  setInitProgressCallback: (
    callback: (report: { text: string; progress: number }) => void
  ) => void;
  reload: (model: string, config: unknown) => Promise<void>;
  getMessage: () => Promise<string>;
  interruptGenerate: () => void;
  chat: {
    completions: {
      create: (params: {
        messages: Message[];
        temperature: number;
        max_tokens?: number;
        stream?: boolean;
        stream_options?: { include_usage: boolean };
        seed?: number;
      }) =>
        | Promise<{
            choices: Array<{
              message: { content: string };
              delta?: { content?: string };
            }>;
            usage?: {
              prompt_tokens: number;
              completion_tokens: number;
              extra: {
                prefill_tokens_per_s: number;
                decode_tokens_per_s: number;
              };
            };
          }>
        | AsyncIterable<{
            choices: Array<{ delta?: { content?: string } }>;
            usage?: {
              prompt_tokens: number;
              completion_tokens: number;
              extra: {
                prefill_tokens_per_s: number;
                decode_tokens_per_s: number;
              };
            };
          }>;
    };
  };
}

interface ToolFunction {
  name: string;
  arguments: Record<string, unknown>;
}

interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_call_id?: number;
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  extra: {
    prefill_tokens_per_s: number;
    decode_tokens_per_s: number;
  };
}

const AIChatContent: React.FC = () => {
  const { registerComponent, unregisterComponent } = useApi();
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [selectedModel, setSelectedModel] = useState(defaultModelId);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<WebLLMEngine | null>(null);
  const toolHandlerRef = useRef<ToolHandler | null>(null);

  // Global messages array like in index.js - this is the source of truth for conversation
  const messagesRef = useRef<Message[]>([]);

  // Get available models from config
  const appConfig = createAppConfig();
  const availableModels = appConfig.model_list;

  useEffect(() => {
    // Register the AI Chat component
    const componentDoc = {
      id: manifest.id,
      type: "AIChat",
      name: manifest.name,
      description: manifest.description,
      path: `/api/${manifest.id}`,
      state: { enabled: true, visible: true },
      actions: [
        {
          id: "sendMessage",
          name: "Send Message",
          description: "Send a message to the AI chat",
          parameters: [
            {
              name: "message",
              type: "string" as const,
              description: "The message to send",
              required: true,
            },
          ],
          available: true,
        },
      ],
    };
    registerComponent(componentDoc);
  }, []);

  const downloadModel = async () => {
    setIsLoading(true);
    setDownloadStatus("Initializing...");
    try {
      // Use the custom app config with all available models
      engineRef.current = new webllm.MLCEngine({ appConfig });

      engineRef.current.setInitProgressCallback(
        (report: { text: string; progress: number }) => {
          setDownloadStatus(report.text);
        }
      );

      // Set temperature based on model (following index.js pattern)
      let temperature = 0.5;
      if (selectedModel.startsWith("Llama-3.1-")) {
        temperature = 0.4;
      }

      const config = {
        temperature: temperature,
        top_p: 0.9,
        context_window_size: -1,
        sliding_window_size: 8192,
        prefill_chunk_size: 8192,
        attention_sink_size: 4096,
      };

      await engineRef.current.reload(selectedModel, config);

      // Initialize tool handler
      toolHandlerRef.current = new ToolHandler(selectedModel);

      setIsModelLoaded(true);
      setDownloadStatus("Model loaded successfully!");

      // Add system message with tool support
      const systemPrompt = toolHandlerRef.current.createSystemPrompt(tools);
      messagesRef.current = [
        {
          role: "system" as const,
          content: systemPrompt,
        },
      ];
      setDisplayMessages([...messagesRef.current]);
    } catch (error) {
      console.error("Error loading model:", error);
      setDownloadStatus("Error loading model. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Streaming generation function with tool support (based on index.js)
  const streamingGenerating = async (
    messages: Message[],
    onUpdate: (content: string) => void,
    onFinish: (
      displayMessage: string,
      usage: Usage | undefined,
      conversationMessage?: string
    ) => void,
    onError: (error: unknown) => void
  ): Promise<{ done: boolean; func?: ToolFunction; error?: string }> => {
    if (!engineRef.current) {
      throw new Error("Engine not loaded");
    }

    try {
      let curMessage = "";
      let usage: Usage | undefined;
      const completion = await engineRef.current.chat.completions.create({
        seed: 0,
        stream: true,
        messages,
        temperature: 0.5,
        stream_options: { include_usage: true },
      });

      // Handle streaming response
      const streamingResponse = completion as AsyncIterable<{
        choices: Array<{ delta?: { content?: string } }>;
        usage?: Usage;
      }>;

      for await (const chunk of streamingResponse) {
        const curDelta = chunk.choices[0]?.delta?.content;
        if (curDelta) {
          curMessage += curDelta;
        }
        if (chunk.usage) {
          usage = chunk.usage;
        }
        onUpdate(curMessage);
      }

      const finalMessage = await engineRef.current.getMessage();

      // Add the assistant's response to the message history BEFORE tool checking (like index.js does)
      // This is crucial so the AI has context in subsequent iterations

      // Handle Tools
      if (toolHandlerRef.current) {
        const rc = toolHandlerRef.current.checkResponse(finalMessage);
        if (rc) {
          if (!rc.error) {
            // For tool calls: add the actual AI response (not the display message) to conversation history
            // The display message is just for UI
            onFinish("**func call:** " + rc.tool_call, usage, finalMessage);
            return { done: false, func: rc.func };
          } else {
            onFinish(
              finalMessage + "\n" + "Error: " + rc.error,
              usage,
              finalMessage
            );
            return { done: false, func: rc.func, error: rc.error };
          }
        }
      }

      // For non-tool responses, the display message and conversation message are the same
      onFinish(finalMessage, usage, finalMessage);
    } catch (err) {
      onError(err);
    }
    return { done: true };
  };

  // Helper functions to manage display messages (like in index.js)
  const appendMessage = (message: Message) => {
    setDisplayMessages((prev) => [...prev, message]);
  };

  const updateLastMessage = (content: string) => {
    setDisplayMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content,
        };
      }
      return newMessages;
    });
  };

  const sendMessage = async () => {
    if (
      !currentInput.trim() ||
      !isModelLoaded ||
      isLoading ||
      !engineRef.current
    )
      return;

    const userMessage: Message = {
      role: "user",
      content: currentInput.trim(),
    };

    // Add to global messages array (source of truth)
    messagesRef.current.push(userMessage);

    // Add to display
    appendMessage(userMessage);
    setCurrentInput("");
    setIsLoading(true);

    try {
      let done = false;
      let iter = 0;

      // Tool calling loop (up to 3 iterations like in index.js)
      while (!done && iter < 3) {
        iter++;
        console.log(`=== Starting iteration ${iter}, done: ${done}`);

        // Add "thinking..." message to display
        const aiMessage: Message = {
          role: "assistant",
          content: "typing...",
        };
        appendMessage(aiMessage);

        const onUpdate = (content: string) => {
          updateLastMessage(content);
        };

        const onFinish = (
          displayMessage: string,
          usage: Usage | undefined,
          conversationMessage?: string
        ) => {
          console.log(
            `=== onFinish called with display: ${displayMessage.substring(
              0,
              100
            )}...`
          );
          updateLastMessage(displayMessage);

          // Add the conversation message (or display message if no conversation message) to global messages array
          const messageToAdd = conversationMessage || displayMessage;
          messagesRef.current.push({
            role: "assistant",
            content: messageToAdd,
          });
          console.log(
            `=== Added assistant message to global array: ${messageToAdd.substring(
              0,
              50
            )}..., total: ${messagesRef.current.length}`
          );
        };

        console.log(
          `=== Calling streamingGenerating with ${messagesRef.current.length} messages`
        );
        const rc = await streamingGenerating(
          messagesRef.current, // Use global messages array
          onUpdate,
          onFinish,
          console.error
        );

        console.log(`=== streamingGenerating returned:`, rc);
        done = rc.done;

        if (!done && toolHandlerRef.current) {
          console.log(
            "=== Tool calling iteration:",
            iter,
            "done:",
            done,
            "func:",
            rc.func
          );
          console.log("Current messages count:", messagesRef.current.length);

          if (rc.error) {
            console.error("Tool calling error:", rc.error);
            messagesRef.current.push({
              content: "Error: " + rc.error,
              tool_call_id: 0,
              role: "user",
            });
          } else {
            const func = rc.func;
            console.log("Processing function:", func);

            // Add "working..." message to display
            const workingMessage: Message = {
              role: "assistant",
              content: "working...",
            };
            appendMessage(workingMessage);

            let toolResp = null;

            try {
              console.log(
                "=== Starting tool execution:",
                func?.name,
                "args:",
                func?.arguments
              );

              if (func && func.name === "fetch_wikipedia_content") {
                console.log(
                  "=== Calling fetch_wikipedia_content with:",
                  func.arguments.search_query
                );
                const ret = await fetch_wikipedia_content(
                  func.arguments.search_query
                );
                console.log("=== Wikipedia API returned:", ret);

                if (!toolHandlerRef.current) {
                  throw new Error(
                    "ToolHandler is null after fetch_wikipedia_content"
                  );
                }

                toolResp = toolHandlerRef.current.genToolResponse(
                  func,
                  JSON.stringify(ret)
                );
                console.log("=== Generated tool response:", toolResp);
              } else if (func && func.name === "sparql_exec") {
                console.log(
                  "=== Calling sparql_exec with:",
                  func.arguments.query
                );
                const ret = await sparql_exec(func.arguments.query);
                console.log("=== SPARQL API returned:", ret);

                if (!toolHandlerRef.current) {
                  throw new Error("ToolHandler is null after sparql_exec");
                }

                toolResp = toolHandlerRef.current.genToolResponse(
                  func,
                  JSON.stringify(ret)
                );
                console.log("=== Generated tool response:", toolResp);
              } else {
                const content = "Error: Unknown function " + func?.name;
                console.error("=== Unknown function:", func?.name);

                if (!toolHandlerRef.current) {
                  throw new Error("ToolHandler is null for unknown function");
                }

                toolResp = toolHandlerRef.current.genToolResponse(
                  func,
                  JSON.stringify(content)
                );
              }
            } catch (e) {
              console.error("=== Tool execution error:", e);
              console.error("=== Error stack:", e.stack);
              const content = "Error: " + e.toString();

              try {
                if (toolHandlerRef.current) {
                  toolResp = toolHandlerRef.current.genToolResponse(
                    func,
                    JSON.stringify(content)
                  );
                } else {
                  console.error(
                    "=== ToolHandler is null, cannot generate error response"
                  );
                  updateLastMessage("**Error:** ToolHandler is null");
                  continue; // Skip this iteration
                }
              } catch (innerError) {
                console.error(
                  "=== Failed to generate error response:",
                  innerError
                );
                updateLastMessage(
                  "**Error:** Failed to generate error response"
                );
                continue; // Skip this iteration
              }
            }

            // Only proceed if we have a valid tool response
            if (toolResp) {
              console.log(
                "=== Successfully generated tool response:",
                toolResp
              );
              try {
                // Add tool response to global messages array
                messagesRef.current.push({
                  content: toolResp.content,
                  tool_call_id: toolResp.tool_call_id,
                  role: toolResp.role as
                    | "user"
                    | "assistant"
                    | "system"
                    | "tool",
                });

                // Update the "working..." message with the tool result
                updateLastMessage("**func result:** " + toolResp.content);
                console.log(
                  "=== Tool response added to messages, total messages:",
                  messagesRef.current.length
                );
              } catch (e) {
                console.error(
                  "=== Error updating messages with tool response:",
                  e
                );
                updateLastMessage(
                  "**Error:** Failed to update with tool response"
                );
              }
            } else {
              // Handle case where toolResp is null
              console.error(
                "=== Failed to generate tool response - toolResp is null"
              );
              updateLastMessage("**Error:** Failed to generate tool response");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating response:", error);
      appendMessage({
        role: "assistant",
        content: "Sorry, I encountered an error generating a response.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [displayMessages]);

  return (
    <div className="flex flex-col h-full bg-white p-4 font-sans">
      {/* Model Selection and Download */}
      <div className="mb-4">
        <p className="mb-2 font-medium">
          Step 1: Initialize WebLLM and Download Model
        </p>
        <div className="flex gap-2 mb-4">
          {" "}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded"
            disabled={isLoading}
          >
            {availableModels.map((model) => (
              <option key={model.model_id} value={model.model_id}>
                {model.model_id}
              </option>
            ))}
          </select>
          <button
            onClick={downloadModel}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? "Loading..." : "Download"}
          </button>
        </div>
        {downloadStatus && (
          <p className="p-2 border border-black text-sm bg-gray-50">
            {downloadStatus}
          </p>
        )}
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        <p className="mb-2 font-medium">Step 2: Chat</p>
        {/* Chat messages */}
        <div
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto bg-gray-300 border-2 border-black p-2 mb-2"
        >
          {displayMessages
            .filter((m) => m.role !== "system")
            .map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          {isLoading && (
            <div className="flex justify-start mb-2">
              <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                Thinking...
              </div>
            </div>
          )}
        </div>
        {/* Input area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-2 border-2 border-black rounded-none"
            disabled={!isModelLoaded || isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!isModelLoaded || isLoading || !currentInput.trim()}
            className="w-24 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>{" "}
      </div>
    </div>
  );
};

export default AIChatContent;
