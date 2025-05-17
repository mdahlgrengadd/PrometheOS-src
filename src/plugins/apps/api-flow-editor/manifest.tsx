import React from 'react';

//import { PluginManifest } from '../../../plugins/types';
import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "api-flow-editor",
  name: "API Flow Editor",
  version: "1.0.0",
  description: "Blueprints-style visual editor for API workflows",
  author: "Desktop System",
  icon: (
    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-primary font-bold">
      FE
    </div>
  ),
  entry: "apps/api-flow-editor",
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "api-flow-editor.js",
  preferredSize: {
    width: 600,
    height: 400,
  },
};

