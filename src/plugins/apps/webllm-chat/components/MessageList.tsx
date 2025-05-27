import React, { useEffect, useRef } from 'react';

interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string; // For tool messages
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

  // Helper to render message content with special formatting for tool calls
  const renderMessageContent = (content: string, role: string) => {
    // Handle special formatting for tool call and tool response
    if (
      content.includes("[Tool Call:") ||
      content.includes("[Executing tool:") ||
      content.includes("[Tool Result]:") ||
      content.includes("[Tool Error]:") ||
      content.includes("[Assistant continues after tool use]")
    ) {
      // Split the content by tool markers
      const parts = content.split(
        /(\[Tool Call:.*?\]|\[Executing tool:.*?\]|\[Tool Result\]:.*?(?=\n\n)|\[Tool Error\]:.*?(?=\n\n)|\[Assistant continues after tool use\])/
      );

      return (
        <>
          {parts.map((part, i) => {
            if (part.startsWith("[Tool Call:")) {
              return (
                <div
                  key={i}
                  className="bg-purple-100 p-2 my-1 rounded text-purple-800 font-medium"
                >
                  {part}
                </div>
              );
            } else if (part.startsWith("[Executing tool:")) {
              return (
                <div
                  key={i}
                  className="bg-blue-100 p-2 my-1 rounded text-blue-800 font-medium"
                >
                  {part}
                </div>
              );
            } else if (part.startsWith("[Tool Result]:")) {
              return (
                <div
                  key={i}
                  className="bg-green-100 p-2 my-1 rounded text-green-800 font-mono text-sm"
                >
                  {part}
                </div>
              );
            } else if (part.startsWith("[Tool Error]:")) {
              return (
                <div
                  key={i}
                  className="bg-red-100 p-2 my-1 rounded text-red-800 font-medium"
                >
                  {part}
                </div>
              );
            } else if (
              part.startsWith("[Assistant continues after tool use]")
            ) {
              return (
                <div
                  key={i}
                  className="bg-gray-100 p-2 my-1 rounded text-gray-800 font-medium"
                >
                  {part}
                </div>
              );
            } else if (part.trim()) {
              return (
                <div key={i} className="whitespace-pre-wrap">
                  {part}
                </div>
              );
            }
            return null;
          })}
        </>
      );
    }

    // Regular content
    return <div className="whitespace-pre-wrap">{content}</div>;
  };

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
                : message.role === "tool"
                ? "bg-green-100 text-green-900 font-mono text-sm"
                : "bg-card text-foreground"
            }`}
          >
            <div className="text-xs font-semibold mb-1 text-left">
              {message.role === "user"
                ? "You"
                : message.role === "tool"
                ? `Tool: ${message.name || "Unknown"}`
                : "AI Assistant"}
            </div>
            <div className="text-left">
              {message.content
                ? renderMessageContent(message.content, message.role)
                : message.role === "assistant" && (
                    <span className="animate-pulse">▋</span>
                  )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
