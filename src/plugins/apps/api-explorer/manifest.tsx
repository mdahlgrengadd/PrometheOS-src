import React from 'react';

import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "api-explorer",
  name: "API Explorer",
  version: "1.0.0",
  description: "Explore and interact with available API components",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34728_code_coding_brackets_code_coding_brackets.png"
      className="h-8 w-8"
      alt="API Explorer"
    />
  ),
  entry: "apps/api-explorer",
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "api-explorer.js",
  preferredSize: {
    width: 600,
    height: 400,
  },
};
