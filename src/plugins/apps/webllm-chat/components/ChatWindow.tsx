import { Settings, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { eventBus } from '@/plugins/EventBus';
import { workerPluginManager } from '@/plugins/WorkerPluginManagerClient';

import { WebLLMChatProvider } from '../WebLLMChatContext';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import ModelSelector from './ModelSelector';

// Define message interface
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: number;
}

// Available models
const AVAILABLE_MODELS = [
  "Llama-3.1-8B-Instruct-q4f32_1-MLC",
  "Phi-3-mini-4k-instruct-q4f32_1-MLC",
  "Gemma-2B-it-q4f32_1-MLC",
  "Mistral-7B-v0.3-q4f32_1-MLC",
];

// System prompt
const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful AI assistant. You have access to tools that can help you perform tasks.";

// Inner component that doesn't have the provider
const ChatUI: React.FC<{
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  loadingProgress: string;
  selectedModel: string;
  engineLoaded: boolean;
  onModelChange: (model: string) => void;
  onSendMessage: (content: string) => void;
  enableFunctionCalling: boolean;
  onEnableFunctionCalling: (enabled: boolean) => void;
  onClearMessages: () => void;
  onToggleSettings: () => void;
}> = ({
  messages,
  isLoading,
  isTyping,
  loadingProgress,
  selectedModel,
  engineLoaded,
  onModelChange,
  onSendMessage,
  enableFunctionCalling,
  onEnableFunctionCalling,
  onClearMessages,
  onToggleSettings,
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="border-b bg-white dark:bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ModelSelector
            models={AVAILABLE_MODELS}
            selectedModel={selectedModel}
            onSelectModel={onModelChange}
            disabled={isLoading || isTyping}
          />

          <div className="ml-4 flex items-center">
            <Switch
              id="function-calling"
              checked={enableFunctionCalling}
              onCheckedChange={onEnableFunctionCalling}
            />
            <Label htmlFor="function-calling" className="ml-2">
              Enable tools
            </Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearMessages}
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSettings}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
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
          <div className="flex-1 overflow-y-auto p-4">
            <MessageList messages={messages} />
          </div>
          <div className="border-t p-4 bg-white dark:bg-gray-800">
            <MessageInput
              onSendMessage={onSendMessage}
              disabled={!engineLoaded || isTyping}
              isTyping={isTyping}
              useContext={true}
              apiId="webllm-chat-input" // Ensure consistent apiId
            />
          </div>
        </>
      )}
    </div>
  );
};

// Main component with state, context provider and UI
const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState<string>(AVAILABLE_MODELS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [enableFunctionCalling, setEnableFunctionCalling] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);

  // Initialize model when selected
  useEffect(() => {
    const loadSelectedModel = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress("Starting model initialization...");

        // Load the model using worker plugin manager
        const result = await workerPluginManager.loadModel(model);

        if (result.status === "success") {
          setIsLoading(false);
        } else {
          throw new Error(result.message || "Failed to load model");
        }
      } catch (error) {
        console.error("Error loading model:", error);
        setLoadingProgress(
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
        setIsLoading(false);

        toast({
          title: "Error",
          description: `Failed to load model: ${
            error instanceof Error ? error.message : String(error)
          }`,
          variant: "destructive",
        });
      }
    };

    loadSelectedModel();

    // Start progress polling
    const progressInterval = setInterval(async () => {
      if (isLoading) {
        try {
          const progress = await workerPluginManager.getModelProgress();
          if (progress) {
            setLoadingProgress(
              `Loading model: ${progress.text} (${Math.round(
                progress.progress * 100
              )}%)`
            );
          }
        } catch (error) {
          console.error("Error getting progress:", error);
        }
      }
    }, 500);

    return () => {
      clearInterval(progressInterval);
    };
  }, [model, isLoading]);

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!model) {
        console.error("No model selected");
        return;
      }

      if (content.trim() === "") return;

      try {
        setIsTyping(true);
        setMessage("");

        // Add user message to the list
        setMessages((prev) => [
          ...prev,
          { role: "user", content, timestamp: Date.now() },
        ]);

        // Get all messages for context
        const messageHistory = [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content },
        ];

        // Choose the appropriate chat method based on enableFunctionCalling
        const chatMethod = enableFunctionCalling
          ? workerPluginManager.chatWithTools.bind(workerPluginManager)
          : workerPluginManager.chat.bind(workerPluginManager);

        // Stream the response
        const stream = await chatMethod(messageHistory, temperature);

        let assistantMessage = "";
        const reader = stream.getReader();

        // Create a timestamp for this message
        const timestamp = Date.now();

        // Add empty assistant message to start
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "", timestamp },
        ]);

        // Process the streaming response
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          // Append to the assistant's message
          assistantMessage += value;

          // Update the assistant's message in the list
          setMessages((prev) =>
            prev.map((m) =>
              m.role === "assistant" && m.timestamp === timestamp
                ? { ...m, content: assistantMessage }
                : m
            )
          );
        }

        setIsTyping(false);

        // Emit event when answer is completed
        eventBus.emit("webllm:answerCompleted", { answer: assistantMessage });
      } catch (error) {
        console.error("Error in chat:", error);
        setIsTyping(false);

        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "An error occurred during chat",
          variant: "destructive",
        });
      }
    },
    [model, messages, systemPrompt, temperature, enableFunctionCalling]
  );

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Toggle settings panel
  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  return (
    <WebLLMChatProvider
      apiId="webllm-chat-input" // Must match apiId in MessageInput
      message={message}
      setMessage={setMessage}
      sendMessage={handleSendMessage}
      isDisabled={isLoading || isTyping}
      isTyping={isTyping}
    >
      <ChatUI
        messages={messages}
        isLoading={isLoading}
        isTyping={isTyping}
        loadingProgress={loadingProgress}
        selectedModel={model}
        engineLoaded={!isLoading}
        onModelChange={setModel}
        onSendMessage={handleSendMessage}
        enableFunctionCalling={enableFunctionCalling}
        onEnableFunctionCalling={setEnableFunctionCalling}
        onClearMessages={clearMessages}
        onToggleSettings={toggleSettings}
      />

      {/* Settings panel would go here */}
    </WebLLMChatProvider>
  );
};

export default ChatWindow;
