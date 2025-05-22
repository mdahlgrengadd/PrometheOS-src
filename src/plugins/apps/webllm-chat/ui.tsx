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
  "Llama-3.1-8B-Instruct-q4f32_1-MLC",
  "Phi-3-mini-4k-instruct-q4f32_1-MLC",
  "Gemma-2B-it-q4f32_1-MLC",
  "Mistral-7B-v0.3-q4f32_1-MLC",
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

        // Create a temporary message for streaming
        const assistantMessage: Message = { role: "assistant", content: "" };
        setMessages([...newMessages, assistantMessage]);

        // Get response stream from worker
        const stream = await workerPluginManager.chat(newMessages, 0.7);

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
    [messages, isModelLoaded, isWorkerReady]
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
      <ChatUI
        messages={messages}
        isWorkerReady={isWorkerReady}
        isLoading={isLoading}
        isTyping={isTyping}
        isModelLoaded={isModelLoaded}
        loadingProgress={loadingProgress}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        onSendMessage={handleSendMessage}
      />
    </WebLLMChatProvider>
  );
};

export default WorkerChatWindow;
