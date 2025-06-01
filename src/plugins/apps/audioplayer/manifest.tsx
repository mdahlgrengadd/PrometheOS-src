import { Music } from "lucide-react";
import React from "react";

import { ApiComponentJson } from "../../../api/core/types";
import { PluginManifest } from "../../../plugins/types";
import * as audioPlayerApiDocModule from "./audioplayer-openapi.json";

// Cast the JSON import to the global API component type
const audioPlayerApiDoc = audioPlayerApiDocModule as ApiComponentJson;

// Export for backward compatibility
export { audioPlayerApiDoc };

export const manifest: PluginManifest & { apiDoc?: typeof audioPlayerApiDoc } =
  {
    id: "audioplayer",
    name: "Audio Player",
    version: "1.0.0",
    description: "A modern audio player",
    author: "Desktop System",
    icon: (
      <div className="flex items-center justify-center h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
        <Music className="h-5 w-5 text-white" />
      </div>
    ),
    entry: "apps/audioplayer",
    preferredSize: {
      width: 600,
      height: 400,
    },
    apiDoc: audioPlayerApiDoc,

    hideWindowChrome: true,
  };
