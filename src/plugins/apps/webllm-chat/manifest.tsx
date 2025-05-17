import React from 'react';

import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
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
};
