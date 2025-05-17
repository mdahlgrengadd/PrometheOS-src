import { Music } from 'lucide-react';
import React from 'react';

import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "audioplayer",
  name: "Audio Player",
  version: "1.0.0",
  description: "A modern audio player",
  author: "Desktop System",
  icon: (
    <div className="flex items-center justify-center h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
      <Music className="h-5 w-5 text-white" />
    </div>
  ),
  entry: "apps/audioplayer",
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "audioplayer.js",
  preferredSize: {
    width: 600,
    height: 400,
  },
};
