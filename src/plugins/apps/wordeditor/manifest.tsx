import React from 'react';
import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "wordeditor",
  name: "Word Editor Pro",
  version: "1.0.0",
  description: "Advanced word processing application with rich text editing",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34684_aim_be_be_aim.png"
      className="h-8 w-8"
      alt="Word Editor Pro"
    />
  ),
  entry: "apps/wordeditor",
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "wordeditor.js", 
  preferredSize: {
    width: 600,
    height: 400,
  },
}; 
