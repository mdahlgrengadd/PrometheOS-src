import React from "react";

import { PluginManifest } from "../../types";

export const manifest: PluginManifest = {
  id: "aichat",
  name: "AI Chat",
  version: "1.0.0",
  description: "WebLLM powered AI chat with tool calling support",
  author: "Desktop System",
  icon: (
    <img
      src={import.meta.env.BASE_URL + "/icons/34688_ans_beos_ans_beos.png"}
      className="h-8 w-8"
      alt="AI Chat"
    />
  ),
  entry: "apps/aichat",
  workerEntrypoint: "aichat.js",
  preferredSize: {
    width: 800,
    height: 600,
  },
};
