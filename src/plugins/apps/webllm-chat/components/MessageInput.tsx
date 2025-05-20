import React, { KeyboardEvent, useState } from "react";

import { Button } from "@/components/ui/api/button";
import { Textarea as ApiTextarea } from "@/components/ui/api/textarea";
import { Textarea as BaseTextarea } from "@/components/ui/textarea";

import { useWebLLMChat } from "../WebLLMChatContext";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isTyping?: boolean;
  apiId?: string;
  useContext?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  isTyping = false,
  apiId = "webllm-chat-input",
  useContext = true,
}) => {
  const [localMessage, setLocalMessage] = useState("");

  // Always call the hook, even if not using context
  const webLLMContext = useWebLLMChat();

  const handleLocalSend = () => {
    if (localMessage.trim() && !disabled) {
      onSendMessage(localMessage);
      setLocalMessage("");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (useContext) {
        webLLMContext.sendMessage();
      } else {
        handleLocalSend();
      }
    }
  };

  // Use either context values or local state based on useContext flag
  const inputMessage = useContext ? webLLMContext.message : localMessage;
  const handleMessageChange = useContext
    ? (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        webLLMContext.setMessage(e.target.value)
    : (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setLocalMessage(e.target.value);
  const handleSendMessage = useContext
    ? () => webLLMContext.sendMessage()
    : handleLocalSend;
  const isInputDisabled = useContext ? webLLMContext.isDisabled : disabled;
  const isAiTyping = useContext ? webLLMContext.isTyping : isTyping;

  return (
    <div className="p-3 border-t border-border">
      {isAiTyping && (
        <div className="text-xs text-muted-foreground mb-2">
          <span className="inline-block mr-1">AI is typing</span>
          <span className="inline-flex">
            <span className="animate-bounce mx-0.5">.</span>
            <span className="animate-bounce mx-0.5 animation-delay-200">.</span>
            <span className="animate-bounce mx-0.5 animation-delay-400">.</span>
          </span>
        </div>
      )}

      <div className="flex items-end space-x-2">
        {useContext ? (
          <BaseTextarea
            className="flex-1 min-h-[40px] max-h-[120px] p-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-background text-foreground"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            disabled={isInputDisabled}
            rows={1}
            style={{ height: "auto", maxHeight: "120px", minHeight: "40px" }}
          />
        ) : (
          <ApiTextarea
            apiId={apiId}
            className="flex-1 min-h-[40px] max-h-[120px] p-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-background text-foreground"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            disabled={isInputDisabled}
            rows={1}
            style={{ height: "auto", maxHeight: "120px", minHeight: "40px" }}
          />
        )}

        <Button
          apiId={`${apiId}-send`}
          apiName="Send Message"
          apiDescription="Send the current message to the AI assistant"
          apiPath="/apps/webllm-chat/input"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isInputDisabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
