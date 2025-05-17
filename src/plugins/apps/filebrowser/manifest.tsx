import { FolderOpen } from 'lucide-react';
import React from 'react';

import { PluginManifest } from '../../../plugins/types';

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
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "filebrowser.js",
  preferredSize: {
    width: 600,
    height: 400,
  },
};
