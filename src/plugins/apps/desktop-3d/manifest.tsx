import React from "react";

import { PluginManifest } from "../../types";

export const manifest: PluginManifest = {
  id: "desktop-3d",
  name: "Desktop 3D",
  version: "1.0.0",
  description: "A 3D desktop environment with interactive windows and icons",
  author: "Desktop System",
  icon: (
    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
      <div className="text-white text-xs font-bold">3D</div>
    </div>
  ),
  entry: "apps/desktop-3d",
  preferredSize: {
    width: 1200,
    height: 800,
  },
  hideWindowChrome: false, // Full 3D environment should control its own UI
};
