import React from "react";

import { PluginManifest } from "../../types";

export const manifest: PluginManifest = {
  id: "app-preview",
  name: "App Preview",
  version: "1.0.0",
  description: "Preview published applications in full-window mode",
  author: "Desktop Dreamscape",
  icon: (
    <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
      <div className="text-white text-sm font-bold">◉</div>
    </div>
  ),
  entry: "apps/app-preview",
  preferredSize: {
    width: 800,
    height: 600,
  },
  hideWindowChrome: false, // Hide window chrome for full app experience
};
