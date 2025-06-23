import React from 'react';

import { PluginManifest } from '../../types';

export const manifest: PluginManifest = {
  id: "jslinux",
  name: "JSLinux",
  version: "1.0.0",
  description: "A JavaScript-based Linux emulator running RISC-V and x86 systems",
  author: "Fabrice Bellard / Desktop System",
  icon: (
    <img
      src={import.meta.env.BASE_URL + "/icons/34763_terminal_beos_terminal_beos.png"}
      className="h-8 w-8"
      alt="JSLinux"
    />
  ),
  entry: "apps/jslinux",  preferredSize: {
    width: 800,
    height: 600,
  },
};
