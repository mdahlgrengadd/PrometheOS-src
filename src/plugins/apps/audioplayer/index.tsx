import React from "react";

import { Plugin, PluginManifest } from "../../types";
import AudioPlayerContent from "./AudioPlayerContent";

// Ensure icon path is correct and valid
export const manifest: PluginManifest = {
  id: "audioplayer", // This ID must match exactly what's in pluginModules
  name: "Audio Player",
  version: "1.0.0",
  description: "A modern audio player",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34691_beos_audio_loud_music_server_speaker_audio_beos_loud_music_server_speaker.png"
      className="h-8 w-8"
      alt="Audio Player"
    />
  ),
  entry: "apps/audioplayer",
  preferredSize: {
    width: 400,
    height: 260,
  },
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
