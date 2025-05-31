import React from "react";

import { PluginManifest } from "../../../plugins/types";

export const manifest: PluginManifest = {
  id: "python-scribe",
  name: "PyServe",
  version: "1.0.0",
  description:
    "Python script processor with AST analysis and TypeScript generation",
  author: "Desktop System",
  icon: (
    <img
      src={
        import.meta.env.BASE_URL +
        "/icons/34690_apple_beos_terminal_beos_terminal_apple.png"
      }
      className="h-8 w-8"
      alt="PyServe"
    />
  ),
  entry: "apps/python-scribe",
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "python-scribe.js",
  preferredSize: {
    width: 1200,
    height: 800,
  },
};
