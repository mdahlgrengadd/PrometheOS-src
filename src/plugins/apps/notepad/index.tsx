
import React from 'react';
import { Plugin, PluginManifest } from '../../types';
import { FileText } from 'lucide-react';

export const manifest: PluginManifest = {
  id: "notepad",
  name: "Notepad",
  version: "1.0.0",
  description: "A simple text editor",
  author: "Desktop System",
  icon: <FileText className="h-8 w-8" />,
  entry: "apps/notepad"
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
  }
};

export default NotepadPlugin;
