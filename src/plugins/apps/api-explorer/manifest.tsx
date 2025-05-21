import React from 'react';

import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "api-explorer",
  name: "API Explorer",
  version: "1.0.0",
  description: "Explore and interact with available API components",
  author: "Desktop System",
  icon: (
    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-primary font-bold">
      AE
    </div>
  ),
  entry: "apps/api-explorer",
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "api-explorer.js",
  preferredSize: {
    width: 1024,
    height: 768,
  },
};
