import React from "react";

import { PluginManifest } from "../../types";

export const manifest: PluginManifest = {
  id: "url-test",
  name: "URL Test",
  version: "1.0.0",
  description:
    "Test plugin for URL scheme handling (http/https/vfs/data/plain)",
  author: "Desktop Dreamscape",
  icon: (
    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-bold">
      URL
    </div>
  ),
  entry: "./apps/url-test/index.tsx",
  preferredSize: {
    width: 600,
    height: 400,
  },
};
