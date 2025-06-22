import { Terminal } from 'lucide-react';
import React from 'react';

import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "terminal",
  name: "Terminal",
  version: "1.0.0",
  description:
    "Full-featured terminal emulator using xterm.js with WASM PTY integration",
  author: "Desktop System",
  icon: <Terminal className="h-8 w-8" />,
  entry: "apps/terminal",
  preferredSize: {
    width: 800,
    height: 600,
  },
};
