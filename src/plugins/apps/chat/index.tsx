import { nanoid } from "nanoid";
import React, { useEffect, useMemo, useState } from "react";

import { Plugin, PluginManifest } from "../../types";
import { ChatUI } from "./components/ChatUI";

import { manifest } from './manifest';

const STORAGE_KEY = "chat-last-room-id";

const ChatPluginRenderer = () => {
  // Try to get the last used roomId from localStorage, otherwise generate a new one
  const [roomId, setRoomId] = useState(() => {
    try {
      const savedRoomId = localStorage.getItem(STORAGE_KEY);
      return savedRoomId || nanoid();
    } catch (e) {
      return nanoid();
    }
  });

  // Save roomId to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, roomId);
    } catch (e) {
      console.error("Failed to save room ID to localStorage:", e);
    }
  }, [roomId]);

  return <ChatUI roomId={roomId} />;
};

const ChatPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => console.log("Chat ready"),
  render: () => <ChatPluginRenderer />,
};

export default ChatPlugin;

