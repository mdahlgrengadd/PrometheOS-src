import React, { useEffect, useState } from 'react';

import { workerPluginManager } from '../../../WorkerPluginManagerClient';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import ModelSelector from './ModelSelector';

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

  // Initialize model
  useEffect(() => {
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

    // Initialize model when component mounts or model changes
    initModel();

    // Cleanup function
    return () => {
      // Clean up progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      // Clean up model resources in worker
      workerPluginManager.cleanupWebLLM().catch((err) => {
        console.error("Error cleaning up WebLLM:", err);
      });
    };
  }, [selectedModel]);

  // Handle model change
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !isModelLoaded) return;

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
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <h2 className="text-lg font-semibold">WebLLM Chat (Worker)</h2>
        <ModelSelector
          models={AVAILABLE_MODELS}
          selectedModel={selectedModel}
          onSelectModel={handleModelChange}
          disabled={isLoading || isTyping}
        />
      </div>

      {isLoading ? (
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
            disabled={!isModelLoaded || isTyping}
            isTyping={isTyping}
          />
        </>
      )}
    </div>
  );
};

export default WorkerChatWindow;
