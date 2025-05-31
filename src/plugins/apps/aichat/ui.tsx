import React, { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
// Import shadcn components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
//import * as webllm from "https://unpkg.com/@mlc-ai/web-llm@0.2.78";
import * as webllm from "@mlc-ai/web-llm";

import {
  registerApiActionHandler,
  useApi,
} from "../../../api/context/ApiContext";
import { workerPluginManager } from "../../WorkerPluginManagerClient";
import { manifest } from "./manifest";
// Import model configuration
import { createAppConfig, defaultModelId } from "./modelConfig";
// Import tool handling infrastructure
import { ToolHandler } from "./toolHandler";
import { fetch_wikipedia_content, sparql_exec } from "./toolImplementations";
import { tools } from "./tools";

// Use the actual WebLLM types
type MLCEngine = webllm.MLCEngine;

interface ToolFunction {
  name: string;
  arguments: Record<string, unknown>;
}

interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
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
  const { registerComponent } = useApi();
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [selectedModel, setSelectedModel] = useState(defaultModelId);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [mcpTools, setMcpTools] = useState<MCPTool[]>([]);
  const [mcpToolsLoaded, setMcpToolsLoaded] = useState(false);
  const engineRef = useRef<MLCEngine | null>(null);
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
    // eslint-disable-next-line
  }, []); // Register action handler for sendMessage
  useEffect(() => {
    const handleSendMessage = async (params?: Record<string, unknown>) => {
      try {
        const message = params?.message as string;
        if (!message || typeof message !== "string") {
          return {
            success: false,
            error: "Message parameter is required and must be a string",
          };
        }

        // Check if model is loaded
        if (!isModelLoaded || !engineRef.current) {
          return {
            success: false,
            error:
              "AI model is not loaded yet. Please initialize the model first.",
          };
        }

        // Auto-start chat if not started
        if (!chatStarted) {
          setChatStarted(true);
        }

        // Create user message directly
        const userMessage: Message = {
          role: "user",
          content: message,
        };

        // Add to global messages array (source of truth)
        messagesRef.current.push(userMessage);

        // Add to display
        appendMessage(userMessage);
        setIsLoading(true);

        // Process the message using the same logic as sendMessage
        try {
          let done = false;
          let iter = 0;

          // Tool calling loop (up to 3 iterations like in sendMessage)
          while (!done && iter < 3) {
            iter++;
            console.log(`=== API sendMessage iteration ${iter}, done: ${done}`);

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
              updateLastMessage(displayMessage);

              // Add the conversation message to global messages array
              const messageToAdd = conversationMessage || displayMessage;
              messagesRef.current.push({
                role: "assistant",
                content: messageToAdd,
              });
            };

            const rc = await streamingGenerating(
              messagesRef.current,
              onUpdate,
              onFinish,
              console.error
            );

            done = rc.done;

            // Handle tool calls if needed
            if (!done && rc.func && toolHandlerRef.current) {
              // Tool handling logic would go here
              // For now, we'll break to avoid infinite loops
              done = true;
            }
          }
        } catch (error) {
          console.error("Error processing API message:", error);
          appendMessage({
            role: "assistant",
            content: "Sorry, I encountered an error processing your message.",
          });
        } finally {
          setIsLoading(false);
        }
        return {
          success: true,
          message: `Message "${message}" sent to AI Chat`,
        };
      } catch (error) {
        console.error("Error in sendMessage action handler:", error);
        return {
          success: false,
          error: `Failed to send message: ${error}`,
        };
      }
    };

    registerApiActionHandler(manifest.id, "sendMessage", handleSendMessage);
  }, [isModelLoaded, chatStarted]);

  // Initialize MCP tools on component mount
  useEffect(() => {
    const initializeMCPTools = async () => {
      try {
        console.log("Initializing MCP server for AI Chat...");

        // Initialize MCP server (this will auto-register existing API components)
        await workerPluginManager.initMCPServer();

        // Load available tools
        const tools = await workerPluginManager.getMCPTools();
        console.log("Loaded MCP tools:", tools);

        setMcpTools(tools);
        setMcpToolsLoaded(true);
      } catch (error) {
        console.error("Error initializing MCP tools:", error);
        setMcpToolsLoaded(true); // Set to true even on error to prevent infinite loading
      }
    };

    initializeMCPTools();
  }, []);

  // Function to refresh MCP tools (can be called when new components are registered)
  const refreshMCPTools = async () => {
    try {
      console.log("Refreshing MCP tools...");
      const tools = await workerPluginManager.getMCPTools();
      console.log("Refreshed MCP tools:", tools);
      setMcpTools(tools);
    } catch (error) {
      console.error("Error refreshing MCP tools:", error);
    }
  };

  // Listen for new API component registrations to refresh tools
  useEffect(() => {
    const handleComponentRegistration = () => {
      // Small delay to ensure component is fully registered
      setTimeout(refreshMCPTools, 100);
    };

    // You can emit this event when components are registered
    window.addEventListener("mcp-tools-refresh", refreshMCPTools);
    window.addEventListener(
      "api-component-registered",
      handleComponentRegistration
    );

    return () => {
      window.removeEventListener("mcp-tools-refresh", refreshMCPTools);
      window.removeEventListener(
        "api-component-registered",
        handleComponentRegistration
      );
    };
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

      await engineRef.current.reload(selectedModel, config); // Initialize tool handler
      toolHandlerRef.current = new ToolHandler(selectedModel);

      setIsModelLoaded(true);
      setDownloadStatus("Model loaded successfully!");

      // Create combined tools list (static tools + MCP tools)
      const combinedTools = [...tools, ...mcpTools];
      console.log("Combined tools for AI:", combinedTools);

      // Add system message with tool support
      const systemPrompt =
        toolHandlerRef.current.createSystemPrompt(combinedTools);
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
      let usage: Usage | undefined; // Convert our Message format to WebLLM format, handling tool messages properly
      const webllmMessages = messages.map((msg) => {
        if (msg.role === "tool") {
          return {
            role: msg.role,
            content: msg.content,
            tool_call_id: msg.tool_call_id || "",
          };
        }
        return {
          role: msg.role,
          content: msg.content,
        };
      }) as webllm.ChatCompletionMessageParam[];

      const completion = await engineRef.current.chat.completions.create({
        seed: 0,
        stream: true,
        messages: webllmMessages,
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
              } else if (
                func &&
                mcpTools.some((tool) => tool.name === func.name)
              ) {
                // This is an MCP tool - execute via workerPluginManager
                console.log(
                  "=== Calling MCP tool:",
                  func.name,
                  "with args:",
                  func.arguments
                );

                const mcpResult = await workerPluginManager.executeMCPTool({
                  name: func.name,
                  arguments: func.arguments,
                });

                console.log("=== MCP tool returned:", mcpResult);

                if (!toolHandlerRef.current) {
                  throw new Error(
                    "ToolHandler is null after MCP tool execution"
                  );
                }

                // Extract text content from MCP result
                let resultText = "No result";
                if (
                  mcpResult &&
                  mcpResult.content &&
                  Array.isArray(mcpResult.content)
                ) {
                  const textContent = mcpResult.content
                    .filter((item) => item.type === "text" && item.text)
                    .map((item) => item.text)
                    .join("\n");
                  resultText = textContent || "No text content";
                }

                toolResp = toolHandlerRef.current.genToolResponse(
                  func,
                  resultText
                );
                console.log("=== Generated MCP tool response:", toolResp);
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
  // Scroll to bottom when messages change
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // For ScrollArea, we need to find the viewport and scroll it
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const viewport = scrollArea.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [displayMessages]);

  // Register action handler for sendMessage API
  useEffect(() => {
    const handleSendMessage = async (params?: Record<string, unknown>) => {
      try {
        const message = params?.message as string;
        if (!message || typeof message !== "string") {
          return {
            success: false,
            error: "Message parameter is required and must be a string",
          };
        }

        // Check if model is loaded
        if (!isModelLoaded || !engineRef.current) {
          return {
            success: false,
            error:
              "AI model is not loaded yet. Please initialize the model first.",
          };
        }

        // Auto-start chat if not started
        if (!chatStarted) {
          setChatStarted(true);
        }

        // Create user message directly and trigger the sendMessage flow
        const userMessage: Message = {
          role: "user",
          content: message,
        };

        // Add to global messages array (source of truth)
        messagesRef.current.push(userMessage);

        // Add to display
        appendMessage(userMessage);
        setIsLoading(true);

        // Use the same streaming generation logic as the UI sendMessage function
        try {
          let done = false;
          let iter = 0;

          while (!done && iter < 3) {
            iter++;
            console.log(`=== API sendMessage iteration ${iter}`);

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
              updateLastMessage(displayMessage);
              const messageToAdd = conversationMessage || displayMessage;
              messagesRef.current.push({
                role: "assistant",
                content: messageToAdd,
              });
            };

            const rc = await streamingGenerating(
              messagesRef.current,
              onUpdate,
              onFinish,
              console.error
            );

            done = rc.done;

            // Basic tool handling - simplified for API calls
            if (!done && rc.func && toolHandlerRef.current) {
              console.log("API call triggered tool:", rc.func.name);
              // For API calls, we'll process one tool iteration then stop
              done = true;
            }
          }
        } catch (error) {
          console.error("Error processing API message:", error);
          appendMessage({
            role: "assistant",
            content: "Sorry, I encountered an error processing your message.",
          });
        } finally {
          setIsLoading(false);
        }

        return {
          success: true,
          message: `Message "${message}" sent to AI Chat successfully`,
        };
      } catch (error) {
        console.error("Error in sendMessage action handler:", error);
        return {
          success: false,
          error: `Failed to send message: ${error}`,
        };
      }
    };

    registerApiActionHandler(manifest.id, "sendMessage", handleSendMessage);
  }, [isModelLoaded, chatStarted]);

  return (
    <div className="flex flex-col h-full bg-background font-sans">
      {!chatStarted ? (
        // Initial Setup Screen
        <div className="flex items-center justify-center h-full p-8">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">AI Chat Setup</CardTitle>
              <CardDescription>
                Select and download an AI model to start chatting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  disabled={isLoading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.model_id} value={model.model_id}>
                        {model.model_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={downloadModel}
                  disabled={isLoading}
                  className="px-8"
                >
                  {isLoading ? "Loading..." : "Download"}
                </Button>
              </div>

              {downloadStatus && (
                <div className="p-4 border rounded-md bg-muted text-sm">
                  {downloadStatus}
                </div>
              )}

              {/* MCP Tools Status */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium flex items-center gap-2">
                    🔧 MCP Tools:
                    {mcpToolsLoaded ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        {mcpTools.length} available
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-700"
                      >
                        Loading...
                      </Badge>
                    )}
                  </span>
                  <Button
                    onClick={refreshMCPTools}
                    disabled={!mcpToolsLoaded}
                    variant="outline"
                    size="sm"
                  >
                    Refresh
                  </Button>
                </div>
                {mcpToolsLoaded && mcpTools.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Available tools:{" "}
                    {mcpTools.map((tool) => tool.name).join(", ")}
                  </div>
                )}
              </div>

              {/* Start Chat Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setChatStarted(true)}
                  disabled={!isModelLoaded}
                  size="lg"
                  className="px-12"
                >
                  Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Main Chat Interface - Full Screen
        <div className="flex flex-col h-full">
          {/* Header with model info and back button */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/50">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setChatStarted(false)}
                variant="outline"
                size="sm"
              >
                ← Back to Setup
              </Button>
              <div>
                <h2 className="font-semibold">{selectedModel}</h2>
                <p className="text-sm text-muted-foreground">
                  {mcpTools.length} tools available
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setDisplayMessages([]);
                messagesRef.current = messagesRef.current.slice(0, 1); // Keep only system message
              }}
              variant="outline"
              size="sm"
            >
              Clear Chat
            </Button>
          </div>

          {/* Chat messages - Full height scrollable area */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
            <div className="p-6 space-y-4">
              {displayMessages
                .filter((m) => m.role !== "system")
                .map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                      <span className="ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input area - Fixed at bottom */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-3">
              <Input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !currentInput.trim()}
                className="px-6"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatContent;
