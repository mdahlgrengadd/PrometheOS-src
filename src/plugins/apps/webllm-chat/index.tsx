import React, { useState } from 'react';

import { Plugin, PluginManifest } from '../../types';
import ChatWindow from './components/ChatWindow';

export const manifest: PluginManifest = {
  id: "webllm-chat",
  name: "AI Chat",
  version: "1.0.0",
  description: "AI chat powered by WebLLM",
  author: "Desktop System",
  icon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-blue-500"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      <circle
        cx="12"
        cy="10"
        r="2"
        fill="currentColor"
        strokeWidth="0"
      ></circle>
    </svg>
  ),
  entry: "apps/webllm-chat",
  preferredSize: {
    width: 800,
    height: 600,
  },
};

const WebLLMChatPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("WebLLM Chat plugin initialized");
  },
  render: () => {
    return <ChatWindow />;
  },
};

export default WebLLMChatPlugin;
