
import React from 'react';
import { Plugin, PluginManifest } from '../../types';
import AudioPlayerContent from './AudioPlayerContent';
import { Music } from 'lucide-react';

export const manifest: PluginManifest = {
  id: "audioplayer",
  name: "Audio Player",
  version: "1.0.0",
  description: "A modern audio player",
  author: "Desktop System",
  icon: <Music className="h-8 w-8" />,
  entry: "apps/audioplayer"
};

const AudioPlayerPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Audio Player plugin initialized");
  },
  render: () => {
    return <AudioPlayerContent />;
  }
};

export default AudioPlayerPlugin;
