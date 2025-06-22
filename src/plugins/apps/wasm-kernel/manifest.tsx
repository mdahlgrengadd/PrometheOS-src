import React from 'react';

import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "wasm-kernel",
  name: "WASM Kernel Demo",
  version: "1.0.0",
  description:
    "A demonstration of the minimal C → WebAssembly kernel with POSIX I/O, PTY, and process table",
  author: "Desktop System",
  icon: (
    <img
      src={import.meta.env.BASE_URL + "/icons/34684_aim_be_be_aim.png"}
      className="h-8 w-8"
      alt="WASM Kernel"
    />
  ),
  entry: "apps/wasm-kernel",
  preferredSize: {
    width: 800,
    height: 600,
  },
};
