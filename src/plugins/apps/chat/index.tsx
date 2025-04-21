import React, { useMemo } from "react";

import { Plugin, PluginManifest } from "../../types";
import { ChatUI } from "./components/ChatUI";

export const manifest: PluginManifest = {
  id: "chat",
  name: "Cloudflare Chat",
  version: "1.0.0",
  description: "Real-time chat via Durable Objects",
  author: "Dreamscape",
  icon: <div className="h-8 w-8 bg-blue-500" />,
  entry: "apps/chat",
  preferredSize: { width: 800, height: 600 },
};

const ChatPluginRenderer = () => {
  const roomId = useMemo(() => crypto.randomUUID(), []);
  return <ChatUI roomId={roomId} />;
};

const ChatPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => console.log("Chat ready"),
  render: () => <ChatPluginRenderer />,
};

export default ChatPlugin;
