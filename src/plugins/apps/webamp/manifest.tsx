import React from 'react';
import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "webamp",
  name: "Webamp Music Player",
  version: "1.0.0",
  description: "A Winamp-inspired music player for your desktop",
  author: "Desktop System",
  icon: (
    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
      W
    </div>
  ),
  entry: "apps/webamp",
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "webamp.js", 
  preferredSize: {
    width: 600,
    height: 400,
  },
}; 
