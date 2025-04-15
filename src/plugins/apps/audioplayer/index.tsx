import React from 'react';

import { Plugin, PluginManifest } from '../../types';
import AudioPlayerContent from './AudioPlayerContent';

export const manifest: PluginManifest = {
  id: "audioplayer",
  name: "Audio Player",
  version: "1.0.0",
  description: "A modern audio player",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34696_cdplayer_beos_cdplayer_beos.png"
      className="h-8 w-8"
      alt="Audio Player"
    />
  ),
  entry: "apps/audioplayer",
};

const AudioPlayerPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Audio Player plugin initialized");
  },
  render: () => {
    return <AudioPlayerContent />;
  },
};

export default AudioPlayerPlugin;
