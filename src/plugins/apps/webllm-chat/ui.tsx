import React, { useCallback, useEffect, useState } from 'react';

import { eventBus } from '@/plugins/EventBus';

import { workerPluginManager } from '../../WorkerPluginManagerClient';
import MessageInput from './components/MessageInput';
import MessageList from './components/MessageList';
import ModelSelector from './components/ModelSelector';
import { manifest } from './manifest';
import { WebLLMChatProvider } from './WebLLMChatContext';

// Define message interface
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Available models
const AVAILABLE_MODELS = [
  "mockup-echo-llm", // Mockup model that echoes user input
  "Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC",
  "Hermes-2-Pro-Mistral-7B",
  "Llama-3.1-8B-Instruct-q4f32_1-MLC",
  "Phi-3-mini-4k-instruct-q4f32_1-MLC",
  //"Gemma-2B-it-q4f32_1-MLC",
  //"Mistral-7B-v0.3-q4f32_1-MLC",
];

// Inner component that doesn't have the provider
const ChatUI: React.FC<{
  messages: Message[];
  isWorkerReady: boolean;
  isLoading: boolean;
  isTyping: boolean;
  isModelLoaded: boolean;
  loadingProgress: string;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onSendMessage: (content: string) => void;
}> = ({
  messages,
  isWorkerReady,
  isLoading,
  isTyping,
  isModelLoaded,
  loadingProgress,
  selectedModel,
  onModelChange,
  onSendMessage,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <h2 className="text-lg font-semibold">WebLLM Chat (Web Worker)</h2>
        <ModelSelector
          models={AVAILABLE_MODELS}
          selectedModel={selectedModel}
          onSelectModel={onModelChange}
          disabled={isLoading || isTyping || !isWorkerReady}
        />
      </div>

      {!isWorkerReady ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
            <p>Initializing WebLLM worker...</p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
            <p>{loadingProgress}</p>
          </div>
        </div>
      ) : (
        <>
          <MessageList messages={messages} />
          <MessageInput
            onSendMessage={onSendMessage}
            disabled={!isModelLoaded || isTyping || !isWorkerReady}
            isTyping={isTyping}
            useContext={true}
            apiId="webllm-chat-input" // Ensure consistent apiId
          />
        </>
      )}
    </div>
  );
};

// Main component with state, context provider and UI
const WorkerChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful AI assistant." },
  ]);
  const [selectedModel, setSelectedModel] = useState<string>(
    AVAILABLE_MODELS[0]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [progressInterval, setProgressInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [toolsEnabled, setToolsEnabled] = useState(true);
  // Debug: hold list of available MCP tools
  const [availableTools, setAvailableTools] = useState<
    {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    }[]
  >([]);

  // Register the WebLLM worker plugin
  useEffect(() => {
    const initWebLLM = async () => {
      try {
        // Check if webllm is already registered
        const isRegistered = await workerPluginManager.isPluginRegistered(
          "webllm"
        );

        if (!isRegistered) {
          // Get the correct worker path based on environment
          let workerPath = undefined;
          if (manifest.workerEntrypoint) {
            workerPath = import.meta.env.PROD
              ? `/worker/${manifest.workerEntrypoint}`
              : `/worker/${manifest.workerEntrypoint}`;
          } else {
            console.error("No workerEntrypoint defined in manifest");
          }
          // Register the webllm plugin with its worker URL
          const success = await workerPluginManager.registerPlugin(
            "webllm",
            workerPath
          );

          if (success) {
            setIsWorkerReady(true);
            console.log("WebLLM worker registered successfully");
            // Expose desktop API bridge and MCP handler to worker via Comlink
            try {
              await workerPluginManager.setupComlinkBridge();
              console.log("Comlink bridge established for WebLLM worker");
            } catch (err) {
              console.error("Failed to setup Comlink bridge:", err);
            }
          } else {
            console.error("Failed to register WebLLM worker");
          }
        } else {
          setIsWorkerReady(true);
          console.log("WebLLM worker already registered");
        }
      } catch (error) {
        console.error("Error initializing WebLLM worker:", error);
      }
    };

    initWebLLM();

    // Clean up when component unmounts
    return () => {
      // We don't unregister here since other instances might use it
    };
  }, []);

  // Register the 'webllm:answerCompleted' event for system-wide discovery
  useEffect(() => {
    eventBus.registerEvent("webllm:answerCompleted");
    return () => {
      eventBus.unregisterEvent("webllm:answerCompleted");
    };
  }, []);

  // Register the MCP server worker plugin when tools are enabled
  useEffect(() => {
    if (!isWorkerReady || !toolsEnabled) return;

    const initMCPServer = async () => {
      try {
        // Check if MCP server is already registered
        const isRegistered = await workerPluginManager.isPluginRegistered(
          "mcp-server"
        );

        if (!isRegistered) {
          // Get the correct worker path based on environment
          const workerPath = import.meta.env.PROD
            ? `/worker/mcp-server.js`
            : `/worker/mcp-server.js`;

          // Register the MCP server plugin with its worker URL
          const success = await workerPluginManager.registerPlugin(
            "mcp-server",
            workerPath
          );

          if (success) {
            // Initialize the MCP server
            try {
              // Initialize MCP server (this sets up the protocol)
              await workerPluginManager.initMCPServer();

              // Explicitly setup Comlink bridge to ensure plugin worker can access manager
              await workerPluginManager.setupComlinkBridge();

              console.log(
                "MCP server registered, initialized, and bridge established"
              );
            } catch (error: unknown) {
              console.error(
                "Failed to initialize MCP server or establish bridge:",
                error
              );
            }
          } else {
            console.error("Failed to register MCP server worker");
          }
        } else {
          console.log("MCP server already registered");
          // Still set up Comlink bridge to ensure worker plugin access
          await workerPluginManager.setupComlinkBridge();
        }
      } catch (error: unknown) {
        console.error("Error initializing MCP server:", error);
      }
    };

    initMCPServer();
  }, [isWorkerReady, toolsEnabled]);

  // Debug: fetch available MCP tools whenever worker is ready and tools are toggled on
  useEffect(() => {
    if (isWorkerReady && toolsEnabled) {
      workerPluginManager
        .getMCPTools()
        .then((toolsList) => {
          console.log("Available MCP tools:", toolsList);
          setAvailableTools(toolsList);
        })
        .catch((err) => console.error("Error fetching MCP tools:", err));
    }
  }, [isWorkerReady, toolsEnabled]);

  // Initialize model once worker is ready
  useEffect(() => {
    if (!isWorkerReady) {
      return; // Wait until worker is registered
    }

    const initModel = async () => {
      try {
        setIsLoading(true);
        setIsModelLoaded(false);
        setLoadingProgress("Starting model initialization...");

        // Start a progress poller
        const interval = setInterval(async () => {
          try {
            const progress = await workerPluginManager.getModelProgress();
            if (progress && progress.text) {
              setLoadingProgress(
                `Loading model: ${
                  progress.text || "Initializing..."
                } (${Math.round(progress.progress * 100)}%)`
              );
            }
          } catch (error) {
            console.error("Error getting progress:", error);
          }
        }, 200);

        setProgressInterval(interval);

        // Initialize model in worker
        const result = await workerPluginManager.loadModel(selectedModel);

        if (result.status === "success") {
          setIsModelLoaded(true);
        } else {
          setLoadingProgress(`Error: ${result.message || "Unknown error"}`);
        }

        setIsLoading(false);

        // Clear interval when done
        if (interval) {
          clearInterval(interval);
          setProgressInterval(null);
        }
      } catch (error) {
        console.error("Error initializing model:", error);
        setLoadingProgress(
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
        setIsLoading(false);

        // Also clear interval on error
        if (progressInterval) {
          clearInterval(progressInterval);
          setProgressInterval(null);
        }
      }
    };

    // Initialize model when worker is ready or model changes
    if (isWorkerReady) {
      initModel();
    }

    // Cleanup function
    return () => {
      // Clean up progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      // Clean up model resources in worker
      if (isWorkerReady) {
        workerPluginManager.cleanupWebLLM().catch((err) => {
          console.error("Error cleaning up WebLLM:", err);
        });
      }
    };
  }, [selectedModel, isWorkerReady]);

  // Handle model change
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  // Toggle tools on/off
  const toggleTools = () => {
    setToolsEnabled(!toolsEnabled);
  };

  // Handle sending a new message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !isModelLoaded || !isWorkerReady) return;

      // Clear input message
      setInputMessage("");

      // Add user message to chat
      const userMessage: Message = { role: "user", content };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      try {
        setIsTyping(true);
        // Remove excessive logging
        // console.log("handleSendMessage: toolsEnabled =", toolsEnabled, "messages =", newMessages);

        // Create a temporary message for streaming
        const assistantMessage: Message = { role: "assistant", content: "" };
        setMessages([...newMessages, assistantMessage]);

        // Get response stream from worker - using chatWithTools if tools are enabled
        const stream = toolsEnabled
          ? await workerPluginManager.chatWithTools(newMessages, 0.7)
          : await workerPluginManager.chat(newMessages, 0.7);

        // Set up the stream reader
        const reader = stream.getReader();
        let streamedContent = "";

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            // Process the chunk
            streamedContent += value;

            // Update message in real-time
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: streamedContent,
              };
              return updated;
            });
          }
        } catch (error) {
          console.error("Error reading from stream:", error);
        } finally {
          reader.releaseLock();
        }

        setIsTyping(false);
        // Emit event when worker answer streaming is completed
        eventBus.emit("webllm:answerCompleted", { answer: streamedContent });
      } catch (error) {
        console.error("Error generating response:", error);

        const errorMessage: Message = {
          role: "assistant",
          content: `Error generating response: ${
            error instanceof Error ? error.message : String(error)
          }`,
        };

        setMessages([...newMessages, errorMessage]);
        setIsTyping(false);
      }
    },
    [messages, isModelLoaded, isWorkerReady, toolsEnabled]
  );

  // Wrap the sendMessage function to handle context-based message sending
  const handleContextSendMessage = useCallback(
    (msgContent?: string) => {
      const content = msgContent || inputMessage;
      if (content.trim()) {
        handleSendMessage(content);
      }
    },
    [inputMessage, handleSendMessage]
  );

  return (
    <WebLLMChatProvider
      key={`webllm-chat-context-${isWorkerReady}-${isModelLoaded}`}
      apiId="webllm-chat-input" // Must match apiId in MessageInput
      message={inputMessage}
      setMessage={setInputMessage}
      sendMessage={handleContextSendMessage}
      isDisabled={!isModelLoaded || isTyping || !isWorkerReady}
      isTyping={isTyping}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-2 border-b">
          <h2 className="text-lg font-semibold">WebLLM Chat (Web Worker)</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2 text-sm">Tools:</span>
              <button
                onClick={toggleTools}
                className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                  toolsEnabled ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                    toolsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <ModelSelector
              models={AVAILABLE_MODELS}
              selectedModel={selectedModel}
              onSelectModel={handleModelChange}
              disabled={isLoading || isTyping || !isWorkerReady}
            />
          </div>
        </div>
        {/* Debug panel: show available MCP tools */}
        <div className="p-2 bg-gray-100 text-xs text-gray-700">
          <div className="font-semibold">Debug: Available Tools</div>
          {availableTools.length > 0 ? (
            <ul>
              {availableTools.map((tool) => (
                <li key={tool.name}>
                  <strong>{tool.name}</strong>: {tool.description}
                </li>
              ))}
            </ul>
          ) : (
            <div>No tools loaded yet.</div>
          )}
        </div>

        {!isWorkerReady ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
              <p>Initializing WebLLM worker...</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
              <p>{loadingProgress}</p>
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} />
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={!isModelLoaded || isTyping || !isWorkerReady}
              isTyping={isTyping}
              useContext={true}
              apiId="webllm-chat-input" // Ensure consistent apiId
            />
          </>
        )}
      </div>
    </WebLLMChatProvider>
  );
};

export default WorkerChatWindow;
