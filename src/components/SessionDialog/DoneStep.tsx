import React from "react";

import { Alert } from "./common";

export interface DoneStepProps {
  connected: boolean;
  messages: string[];
  testMessage: string;
  setTestMessage: (msg: string) => void;
  sendMessage: (msg: string) => void;
  onClose: () => void;
}

export function DoneStep({
  connected,
  messages,
  testMessage,
  setTestMessage,
  sendMessage,
  onClose,
}: DoneStepProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-md bg-gray-50">
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`h-3 w-3 rounded-full ${
              connected ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <p className="font-medium">
            {connected ? "Connected to peer" : "Waiting for connection..."}
          </p>
        </div>
        {connected && (
          <p className="text-sm text-gray-600">
            Your desktop is now synchronized. Window actions will be mirrored.
          </p>
        )}
      </div>

      {connected && (
        <div className="border-t pt-4">
          <div className="mb-2">
            <p className="text-sm font-medium mb-2">Test Message</p>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Type a test message…"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && testMessage) {
                    sendMessage(
                      JSON.stringify({ type: "chat", payload: testMessage })
                    );
                    setTestMessage("");
                  }
                }}
              />
              <button
                type="button"
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                onClick={() => {
                  if (testMessage) {
                    sendMessage(
                      JSON.stringify({ type: "chat", payload: testMessage })
                    );
                    setTestMessage("");
                  }
                }}
              >
                Send
              </button>
            </div>
          </div>

          {messages.length > 0 && (
            <div className="mt-4 border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 text-xs font-medium border-b">
                Message Log
              </div>
              <div className="p-3 max-h-40 overflow-y-auto text-sm">
                {messages.map((msg, i) => (
                  <div key={i} className="mb-1 last:mb-0">
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
