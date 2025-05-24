import React from 'react';

import { PluginManifest } from '../../types';

export const manifest: PluginManifest = {
  id: "builder",
  name: "IDE Builder",
  version: "1.0.0", 
  description: "A full-featured IDE environment for code editing and development",
  author: "Desktop System",
  icon: (
    <img
      src={import.meta.env.BASE_URL + "/icons/34704_desktop_beos_desktop_beos.png"}
      className="h-8 w-8"
      alt="IDE Builder"
    />
  ),
  entry: "apps/builder",
  preferredSize: {
    width: 1200,
    height: 800,
  },
  hideWindowChrome: true, // IDE should control its own chrome
};
