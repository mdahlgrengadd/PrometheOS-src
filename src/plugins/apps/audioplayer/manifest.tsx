import { Music } from 'lucide-react';
import React from 'react';

import { PluginManifest } from '../../../plugins/types';

/**
 * API documentation for the audio player
 */
export const audioPlayerApiDoc = {
  type: "AudioPlayer",
  description: "An audio player component with playback controls",
  state: {
    enabled: true,
    visible: true,
    isPlaying: false,
    currentTrack: 0,
    volume: 1.0,
    isMuted: false,
  },
  actions: [
    { id: "play", name: "Play", description: "Start playback of current track", available: true, parameters: [] },
    { id: "pause", name: "Pause", description: "Pause playback of current track", available: true, parameters: [] },
    { id: "next", name: "Next Track", description: "Skip to next track", available: true, parameters: [] },
    { id: "previous", name: "Previous Track", description: "Skip to previous track", available: true, parameters: [] },
    { id: "toggleMute", name: "Toggle Mute", description: "Mute or unmute audio", available: true, parameters: [] },
    { id: "setVolume", name: "Set Volume", description: "Set the volume level", available: true,
      parameters: [{ name: "volume", type: "number", description: "Volume level (0.0 to 1.0)", required: true }] },
  ],
  path: "/apps/audioplayer/controls",
};

export const manifest: PluginManifest & { apiDoc?: typeof audioPlayerApiDoc } = {
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
  preferredSize: {
    width: 600,
    height: 400,
  },
  apiDoc: audioPlayerApiDoc,
};
