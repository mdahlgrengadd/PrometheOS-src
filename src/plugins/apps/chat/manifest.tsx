import React from 'react';
import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "chat",
  name: "Cloudflare Chat",
  version: "1.0.0",
  description: "Real-time chat via Durable Objects",
  author: "Desktop System",
  icon: (
    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
      P
    </div>
  ),
  entry: "apps/chat",
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "chat.js", 
  preferredSize: {
    width: 600,
    height: 400,
  },
}; 
