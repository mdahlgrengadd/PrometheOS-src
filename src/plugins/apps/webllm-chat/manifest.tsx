import React from "react";

import { PluginManifest } from "../../../plugins/types";

/**
 * API documentation for the WebLLM Chat
 */
export const webllmChatApiDoc = {
  type: "WebLLMChat",
  description: "A chat interface for WebLLM AI models running in a Web Worker",
  state: {
    enabled: true,
    visible: true,
    message: "",
    isDisabled: false,
    isTyping: false,
  },
  actions: [
    {
      id: "sendMessage",
      name: "Send Message",
      description: "Send a message to the AI assistant",
      available: true,
      parameters: [
        {
          name: "message",
          type: "string",
          description:
            "The message to send (optional, uses current input if not provided)",
          required: false,
        },
      ],
    },
    {
      id: "setInputText",
      name: "Set Input Text",
      description: "Set the text in the input field",
      available: true,
      parameters: [
        {
          name: "text",
          type: "string",
          description: "The text to set in the input field",
          required: true,
        },
      ],
    },
    {
      id: "getInputText",
      name: "Get Input Text",
      description: "Get the current text in the input field",
      available: true,
      parameters: [],
    },
    {
      id: "clearInput",
      name: "Clear Input",
      description: "Clear the input field",
      available: true,
      parameters: [],
    },
  ],
  path: "/apps/webllm-chat/input",
};

export const manifest: PluginManifest & { apiDoc?: typeof webllmChatApiDoc } = {
  id: "webllm-chat",
  name: "WebLLM Chat",
  version: "1.0.0",
  description: "Chat with an AI using WebLLM running in a Web Worker",
  author: "Desktop System",
  icon: <img src="/icons/ai_icon.png" className="h-8 w-8" alt="WebLLM Chat" />,
  entry: "apps/webllm-chat",
  workerEntrypoint: "webllm.js",
  preferredSize: {
    width: 800,
    height: 600,
  },
  apiDoc: webllmChatApiDoc,
};
