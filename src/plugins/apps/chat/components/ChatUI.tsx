import { usePartySocket } from "partysocket/react";
import React, { useState } from "react";

import {
  ChatMessage,
  Message,
  names,
  type,
} from "../../../../lib/cloudflare-chat/src/shared";

interface ChatUIProps {
  roomId: string;
}

export const ChatUI: React.FC<ChatUIProps> = ({ roomId }) => {
  const [name] = useState(
    () => names[Math.floor(Math.random() * names.length)]
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socket = usePartySocket({
    party: "chat",
    room: roomId,
    onMessage: (evt) => {
      const msg = JSON.parse(evt.data as string) as Message;
      if (msg.type === "add")
        setMessages((ms) => [
          ...ms,
          {
            id: msg.id,
            content: msg.content,
            user: msg.user,
            role: msg.role,
          },
        ]);
      else if (msg.type === "all") setMessages(msg.messages);
    },
  });

  const send = (content: string) => {
    const m = {
      id: crypto.randomUUID().slice(0, 8),
      user: name,
      role: "user" as const,
      content,
    };
    socket.send(JSON.stringify({ type: "add", ...m }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        {messages.map((m) => (
          <div key={m.id} className="p-2 border-b">
            <strong>{m.user}:</strong> {m.content}
          </div>
        ))}
      </div>
      <form
        className="p-2"
        onSubmit={(e) => {
          e.preventDefault();
          const txt = (
            e.currentTarget.elements.namedItem("content") as HTMLInputElement
          ).value;
          send(txt);
          e.currentTarget.reset();
        }}
      >
        <input
          name="content"
          className="w-full p-1 border"
          placeholder={`Hello ${name}!`}
        />
      </form>
    </div>
  );
};
