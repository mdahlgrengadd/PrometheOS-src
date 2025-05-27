import { nanoid } from 'nanoid';
import { usePartySocket } from 'partysocket/react';
import React, { useEffect, useState } from 'react';

import { ChatMessage, Message, names } from '../types';

// Set this to your dev or prod Worker URL:
const CHAT_HOST =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8787"
    : "https://cloudflare-chat.mdahlgrengadd.workers.dev";

interface ChatUIProps {
  roomId: string;
}

export const ChatUI: React.FC<ChatUIProps> = ({ roomId: initialRoomId }) => {
  // Room ID state
  const [roomId, setRoomId] = useState(initialRoomId);
  const [roomAction, setRoomAction] = useState<"create" | "join" | null>(null);
  const [inputRoomId, setInputRoomId] = useState("");
  const fullUrl = `${CHAT_HOST}/${roomId}`;
  const [name] = useState(
    () => names[Math.floor(Math.random() * names.length)]
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirmed, setPasswordConfirmed] = useState(false);
  const [ttl, setTtl] = useState(3600); // default 1 hour
  const [roomCreated, setRoomCreated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMessages([]);
    setPassword("");
    setPasswordConfirmed(false);
    setRoomCreated(false);
    setError("");
  }, [roomId]);
  const socket = usePartySocket({
    party: "chat",
    room: roomId,
    host: CHAT_HOST,
    onMessage: (evt) => {
      const data = JSON.parse(evt.data as string);
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.ok) {
        if (data.verified) {
          // Password verification successful
          setPasswordConfirmed(true);
          setError("");
        } else {
          // Room creation successful
          setRoomCreated(true);
          setPasswordConfirmed(true);
          setError("");
        }
        return;
      }
      const msg = data as Message;
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

  // Room creation logic
  const createRoom = () => {
    if (password.length < 3) {
      setError("Password must be at least 3 characters long");
      return;
    }
    socket.send(JSON.stringify({ type: "create-room", password, ttl }));
  };
  // Password confirmation for joining existing room
  const verifyPassword = () => {
    if (!password) {
      setError("Password is required");
      return;
    }
    // Send password verification request to server
    socket.send(JSON.stringify({ type: "verify-password", password }));
  };

  // UI for room selection and password/TTL prompt
  if (!passwordConfirmed) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="p-4 border rounded bg-white max-w-sm w-full">
          <h3 className="mb-2 font-bold">Start Chat</h3>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {!roomAction && (
            <>
              <div className="mb-2">
                <label className="block mb-1">Room Name/ID</label>
                <input
                  className="w-full p-1 border mb-2"
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value)}
                  placeholder="Enter a room name or ID"
                />
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-blue-500 text-white py-1 rounded"
                    onClick={() => {
                      if (!inputRoomId.trim()) {
                        setError("Room name/ID required");
                        return;
                      }
                      setRoomId(inputRoomId.trim());
                      setRoomAction("join");
                      setError("");
                    }}
                  >
                    Join Room
                  </button>
                  <button
                    className="flex-1 bg-green-500 text-white py-1 rounded"
                    onClick={() => {
                      if (!inputRoomId.trim()) {
                        setError("Room name/ID required");
                        return;
                      }
                      setRoomId(inputRoomId.trim());
                      setRoomAction("create");
                      setError("");
                    }}
                  >
                    Create Room
                  </button>
                </div>
                <button
                  className="mt-2 w-full bg-gray-200 text-gray-700 py-1 rounded"
                  onClick={() => {
                    const randomRoom = nanoid(8);
                    setInputRoomId(randomRoom);
                  }}
                >
                  Generate Random Room
                </button>
              </div>
            </>
          )}
          {!!roomAction && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (roomAction === "create") createRoom();
                else verifyPassword();
              }}
            >
              <div className="mb-2">
                <label className="block mb-1">
                  Room: <span className="font-mono">{roomId}</span>
                </label>
              </div>
              <label className="block mb-1">Password</label>
              <input
                type="password"
                className="w-full p-1 border mb-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {roomAction === "create" && (
                <>
                  <label className="block mb-1">
                    Room Expiration (seconds)
                  </label>
                  <select
                    className="w-full p-1 border mb-2"
                    value={ttl}
                    onChange={(e) => setTtl(Number(e.target.value))}
                  >
                    <option value={3600}>1 hour</option>
                    <option value={7200}>2 hours</option>
                    <option value={14400}>4 hours</option>
                    <option value={28800}>8 hours</option>
                    <option value={86400}>24 hours</option>
                  </select>
                </>
              )}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-1 rounded"
              >
                {roomAction === "create" ? "Create Room" : "Join Room"}
              </button>
              <button
                type="button"
                className="w-full mt-2 bg-gray-300 text-gray-700 py-1 rounded"
                onClick={() => {
                  setRoomAction(null);
                  setPassword("");
                  setError("");
                }}
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const send = (content: string) => {
    const m = {
      id: nanoid(8),
      user: name,
      role: "user" as const,
      content,
    };
    socket.send(JSON.stringify({ type: "add", password, ...m }));
  };

  // Removed: handleRoomChange (now handled in the new UI)

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
            {/*<button
              onClick={() => {
                navigator.clipboard
                  .writeText(fullUrl)
                  .catch((err) => console.error("Failed to copy URL: ", err));
              }}
              className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              Copy URL
            </button>*/}
          </div>
          <button
            onClick={handleRandomRoom}
            className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Random Room
          </button>
        </div>
        {/* Room change form removed, now handled in the new UI above */}
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
