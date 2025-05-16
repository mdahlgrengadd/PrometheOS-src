import React, { useEffect, useRef } from 'react';

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter out system messages
  const visibleMessages = messages.filter((msg) => msg.role !== "system");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {visibleMessages.length === 0 && (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <p>Start a conversation with the AI assistant</p>
        </div>
      )}

      {visibleMessages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              message.role === "user"
                ? "bg-blue-100 text-blue-900"
                : "bg-card text-foreground"
            }`}
          >
            <div className="text-xs font-semibold mb-1 text-left">
              {message.role === "user" ? "You" : "AI Assistant"}
            </div>
            <div className="whitespace-pre-wrap text-left">
              {message.content ||
                (message.role === "assistant" && (
                  <span className="animate-pulse">▋</span>
                ))}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
