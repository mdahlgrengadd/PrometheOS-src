import React from 'react';

import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "browser",
  name: "Browser",
  version: "1.0.0",
  description: "A simple web browser",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34686_acrobat_beos_acrobat_beos.png"
      className="h-8 w-8"
      alt="Browser"
    />
  ),
  entry: "apps/browser",
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "browser.js",
  preferredSize: {
    width: 1024,
    height: 768,
  },
};
