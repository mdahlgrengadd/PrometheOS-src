
import React from 'react';
import { FolderOpen } from 'lucide-react';

import { Plugin, PluginManifest } from '../../types';
import FileBrowserContent from './components/FileBrowserContent';

// Define the manifest for the File Browser plugin
export const manifest: PluginManifest = {
  id: "filebrowser",
  name: "File Browser",
  version: "1.0.0",
  description: "File system browser with drag and drop support",
  author: "Desktop System",
  icon: (
    <div className="flex items-center justify-center h-8 w-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full">
      <FolderOpen className="h-5 w-5 text-white" />
    </div>
  ),
  entry: "apps/filebrowser",
  preferredSize: {
    width: 700,
    height: 500,
  },
};

// Define the File Browser plugin
const FileBrowserPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log(
      "File Browser plugin initialized - " + new Date().toISOString()
    );
  },
  render: () => {
    return <FileBrowserContent />;
  },
};

export default FileBrowserPlugin;
