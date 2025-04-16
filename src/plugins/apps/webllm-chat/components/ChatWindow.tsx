import React, { useEffect, useState } from 'react';

import * as webllm from '@mlc-ai/web-llm';

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

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful AI assistant." },
  ]);
  const [engine, setEngine] = useState<webllm.MLCEngine | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(
    AVAILABLE_MODELS[0]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Initialize model
  useEffect(() => {
    const initModel = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress("Starting model initialization...");

        // Initialize engine with progress callback
        const newEngine = await webllm.CreateMLCEngine(selectedModel, {
          initProgressCallback: (progress) => {
            setLoadingProgress(
              `Loading model: ${
                progress.text || "Initializing..."
              } (${Math.round(progress.progress * 100)}%)`
            );
          },
        });

        setEngine(newEngine);
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing model:", error);
        setLoadingProgress(
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
        setIsLoading(false);
      }
    };

    // Initialize model when component mounts or model changes
    initModel();

    // Cleanup function
    return () => {
      if (engine) {
        // Clean up engine resources if needed
      }
    };
  }, [selectedModel]);

  // Handle model change
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !engine) return;

    // Add user message to chat
    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      setIsTyping(true);

      // Create a temporary message for streaming
      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages([...newMessages, assistantMessage]);

      // Convert messages to format expected by webllm
      const apiMessages = newMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Stream response
      const chunks = await engine.chat.completions.create({
        messages: apiMessages,
        temperature: 0.7,
        stream: true,
      });

      let streamedContent = "";

      for await (const chunk of chunks) {
        const content = chunk.choices[0]?.delta.content || "";
        streamedContent += content;

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
        <h2 className="text-lg font-semibold">WebLLM Chat</h2>
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
            disabled={!engine || isTyping}
            isTyping={isTyping}
          />
        </>
      )}
    </div>
  );
};

export default ChatWindow;
