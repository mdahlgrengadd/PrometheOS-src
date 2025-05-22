import React from 'react';

import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "settings",
  name: "Settings",
  version: "1.0.0",
  description: "System settings application",
  author: "Desktop System",
  icon: (
    <img
      src={
        import.meta.env.BASE_URL +
        "/icons/34685_display_beos_apple_17_beos_studio_display_apple_17_studio.png"
      }
      className="h-8 w-8"
      alt="Settings"
    />
  ),
  entry: "apps/settings",
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "settings.js",
  preferredSize: {
    width: 1024,
    height: 768,
  },
};
