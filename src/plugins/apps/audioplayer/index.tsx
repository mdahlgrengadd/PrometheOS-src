import React from 'react';
import { Music } from 'lucide-react';

import { Plugin, PluginManifest } from '../../types';
import AudioPlayerContent from './AudioPlayerContent';

// Ensure icon path is correct and valid
export const manifest: PluginManifest = {
  id: "audioplayer", // This ID must match exactly what's in pluginModules
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
  preferredSize: {
    width: 400,
    height: 300,
  },
  hideWindowChrome: true,
};

const AudioPlayerPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log(
      "Audio Player plugin initialized - " + new Date().toISOString()
    );
  },
  render: () => {
    return <AudioPlayerContent />;
  },
};

// Make sure default export is properly defined
export default AudioPlayerPlugin;
