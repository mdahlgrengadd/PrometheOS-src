import React from 'react';

import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "calculator",
  name: "Calculator",
  version: "1.0.0",
  description: "A simple calculator",
  author: "Desktop System",
  icon: (
    <img
      src={
        import.meta.env.BASE_URL +
        "/icons/34689_beos_blocks_cubos_serv_app_beos_blocks_cubos_serv_app.png"
      }
      className="h-8 w-8"
      alt="Calculator"
    />
  ),
  entry: "apps/calculator",
  workerEntrypoint: "calculator.js",
  preferredSize: {
    width: 320,
    height: 420,
  },
};
