import React from 'react';

import { Plugin, PluginManifest } from '../../types';

export const manifest: PluginManifest = {
  id: "notepad",
  name: "Notepad",
  version: "1.0.0",
  description: "A simple text editor",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34688_ans_beos_ans_beos.png"
      className="h-8 w-8"
      alt="Notepad"
    />
  ),
  entry: "apps/notepad",
  preferredSize: {
    width: 500,
    height: 400,
  },
};

const NotepadPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Notepad plugin initialized");
  },
  render: () => {
    return (
      <div className="p-4">
        <textarea
          className="w-full h-64 p-2 border border-gray-300 rounded"
          placeholder="Type your notes here..."
        />
      </div>
    );
  },
};

export default NotepadPlugin;
