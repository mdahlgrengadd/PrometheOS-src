import React from 'react';

import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "prometheos-test",
  name: "PrometheOS Test App",
  version: "1.0.0",
  description: "Test app demonstrating prometheos-client library functionality",
  author: "Desktop System",
  icon: (
    <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
      PT
    </div>
  ),
  entry: "apps/prometheos-test",
  preferredSize: {
    width: 600,
    height: 500,
  },
};
