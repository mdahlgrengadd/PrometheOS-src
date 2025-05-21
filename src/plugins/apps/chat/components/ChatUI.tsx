import { nanoid } from 'nanoid';
import { usePartySocket } from 'partysocket/react';
import React, { useEffect, useState } from 'react';

import { ChatMessage, Message, names } from '../types';

// ← set this to whatever your live Worker URL is:
const CHAT_HOST = "https://cloudflare-chat.mdahlgrengadd.workers.dev";
//const CHAT_HOST = "http://127.0.0.1:8787";

interface ChatUIProps {
  roomId: string;
}

export const ChatUI: React.FC<ChatUIProps> = ({ roomId: initialRoomId }) => {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [newRoomId, setNewRoomId] = useState("");

  // Show the full room URL
  const fullUrl = `${CHAT_HOST}/${roomId}`;

  const [name] = useState(
    () => names[Math.floor(Math.random() * names.length)]
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  useEffect(() => {
    // Clear messages when changing rooms
    setMessages([]);
  }, [roomId]);

  const socket = usePartySocket({
    party: "chat",
    room: roomId,
    host: CHAT_HOST,
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
      id: nanoid(8),
      user: name,
      role: "user" as const,
      content,
    };
    socket.send(JSON.stringify({ type: "add", ...m }));
  };

  const handleRoomChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomId.trim()) {
      setRoomId(newRoomId.trim());
      setNewRoomId("");
    }
  };

  const handleRandomRoom = () => {
    const randomRoom = nanoid(8);
    setRoomId(randomRoom);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopiedMessageId(id);
        setTimeout(() => setCopiedMessageId(null), 2000);
      })
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b">
        <div className="flex items-center mb-2">
          <div className="text-sm text-gray-500 flex-1 flex items-center">
            <span className="truncate">Current room: {roomId}</span>
            <button
              onClick={() => {
                navigator.clipboard
                  .writeText(fullUrl)
                  .catch((err) => console.error("Failed to copy URL: ", err));
              }}
              className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              Copy URL
            </button>
          </div>
          <button
            onClick={handleRandomRoom}
            className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Random Room
          </button>
        </div>
        <form className="flex" onSubmit={handleRoomChange}>
          <input
            value={newRoomId}
            onChange={(e) => setNewRoomId(e.target.value)}
            className="flex-1 p-1 border text-sm"
            placeholder="Enter room ID to join or create"
          />
          <button
            type="submit"
            className="ml-2 px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Join Room
          </button>
        </form>
      </div>
      <div className="flex-1 overflow-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className="p-2 border-b flex justify-between items-start"
          >
            <div className="flex-1 break-all">
              <strong>{m.user}:</strong> {m.content}
            </div>
            <button
              onClick={() => handleCopy(m.id, m.content)}
              className="ml-2 px-2 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300"
            >
              {copiedMessageId === m.id ? "Copied!" : "Copy"}
            </button>
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
