import React from 'react';
import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "webllm2-chat",
  name: "Webllm2-chat",
  version: "1.0.0",
  description: "Webllm2-chat plugin",
  author: "Desktop System",
  icon: (
    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
      P
    </div>
  ),
  entry: "apps/webllm2-chat",
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "webllm2-chat.js", 
  preferredSize: {
    width: 600,
    height: 400,
  },
}; 
